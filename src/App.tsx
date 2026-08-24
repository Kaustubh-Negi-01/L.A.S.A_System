import React, { useCallback, useEffect, useState } from 'react';
import { SharedProvider, useSharedContext } from './context/SharedContext';
import { SmartphoneFrame } from './components/layout/SmartphoneFrame';
import { ModeSelection, type AppTab } from './components/mode/ModeSelection';
import { BottomNav } from './components/layout/BottomNav';
import { SettingsModal } from './components/settings/SettingsModal';
import { StudyDashboard } from './components/study/StudyDashboard';
import { VisualHub } from './components/visual/VisualHub';
import { ProductivityHub } from './components/productivity/ProductivityHub';
import './App.css';
import { installInteractionSoundBridge, useInteractionFeedback } from './hooks/useInteractionFeedback';


const AppContent: React.FC = () => {
  useInteractionFeedback();

  useEffect(() => installInteractionSoundBridge(), []);
  const { tasks } = useSharedContext();
  const [activeTab, setActiveTab] = useState<AppTab>('visual');
  const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = useCallback((nextTab: AppTab) => {
    if (nextTab === activeTab && !isModeSelectionOpen || isTransitioning) return;
    setIsTransitioning(true);
    window.setTimeout(() => {
      setActiveTab(nextTab);
      setIsModeSelectionOpen(false);
      window.requestAnimationFrame(() => setIsTransitioning(false));
    }, 120);
  }, [activeTab, isModeSelectionOpen, isTransitioning]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false);
        return;
      }
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      const shortcuts: Record<string, AppTab> = { '1': 'visual', '2': 'study', '3': 'productivity' };
      const nextTab = shortcuts[event.key];
      if (nextTab) navigateTo(nextTab);
    };

    let touchStartX = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? 0;
      const distance = touchEndX - touchStartX;
      if (Math.abs(distance) < 56) return;
      const tabs: AppTab[] = ['visual', 'study', 'productivity'];
      const nextIndex = tabs.indexOf(activeTab) + (distance < 0 ? 1 : -1);
      if (nextIndex >= 0 && nextIndex < tabs.length) navigateTo(tabs[nextIndex]);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeTab, navigateTo]);

  const pendingTasksCount = tasks.filter(task => task.status !== 'completed').length;

  return (
    <>
        <SmartphoneFrame
            activeTab={activeTab}
            isModeSelection={isModeSelectionOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        bottomNav={
          <BottomNav
            activeTab={activeTab}
            setActiveTab={navigateTo}
            unreadTasksCount={pendingTasksCount}
          />
        }
      >
        <div className={`screen-view ${isTransitioning ? 'is-leaving' : 'is-entering'}`} key={isModeSelectionOpen ? 'mode-selection' : activeTab}>
          {isModeSelectionOpen && <ModeSelection onSelectMode={navigateTo} />}

          {!isModeSelectionOpen && activeTab === 'visual' && (
            <VisualHub
              onNavigateToStudy={() => navigateTo('study')}
              onNavigateToProductivity={() => navigateTo('productivity')}
            />
          )}

          {!isModeSelectionOpen && activeTab === 'study' && <StudyDashboard />}

          {!isModeSelectionOpen && activeTab === 'productivity' && (
            <ProductivityHub
              onNavigateToStudy={() => navigateTo('study')}
            />
          )}
        </div>
      </SmartphoneFrame>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSwitchMode={() => {
          setIsSettingsOpen(false);
          setIsModeSelectionOpen(true);
        }}
      />
    </>
  );
};

export function App() {
  return (
    <SharedProvider>
      <AppContent />
    </SharedProvider>
  );
}

export default App;
