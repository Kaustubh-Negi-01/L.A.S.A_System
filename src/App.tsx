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

  const goHome = useCallback(() => {
    setIsSettingsOpen(false);
    setIsModeSelectionOpen(true);
    setIsTransitioning(false);
  }, []);

  const goBack = useCallback(() => {
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    if (isModeSelectionOpen) return;
    const tabs: AppTab[] = ['visual', 'study', 'productivity'];
    const previousTab = tabs[tabs.indexOf(activeTab) - 1];
    if (previousTab) navigateTo(previousTab);
    else goHome();
  }, [activeTab, goHome, isModeSelectionOpen, isSettingsOpen, navigateTo]);

  const goForward = useCallback(() => {
    if (isModeSelectionOpen || isSettingsOpen) return;
    const tabs: AppTab[] = ['visual', 'study', 'productivity'];
    const nextTab = tabs[tabs.indexOf(activeTab) + 1];
    if (nextTab) navigateTo(nextTab);
  }, [activeTab, isModeSelectionOpen, isSettingsOpen, navigateTo]);

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

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeTab, navigateTo]);

  const pendingTasksCount = tasks.filter(task => task.status !== 'completed').length;

  return (
    <>
        <SmartphoneFrame
            activeTab={activeTab}
            isModeSelection={isModeSelectionOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwipeBack={goBack}
        onSwipeForward={goForward}
        onSwipeUpHome={goHome}
        onNavigateToTab={navigateTo}
        overlay={
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSwitchMode={() => {
              setIsSettingsOpen(false);
              setIsModeSelectionOpen(true);
            }}
          />
        }
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
