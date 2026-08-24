import React, { useState } from 'react';
import { SharedProvider, useSharedContext } from './context/SharedContext';
import { SmartphoneFrame } from './components/layout/SmartphoneFrame';
import { BottomNav } from './components/layout/BottomNav';
import { SettingsModal } from './components/settings/SettingsModal';
import { StudyDashboard } from './components/study/StudyDashboard';
import { VisualHub } from './components/visual/VisualHub';
import { ProductivityHub } from './components/productivity/ProductivityHub';
import './App.css';

const AppContent: React.FC = () => {
  const { tasks } = useSharedContext();
  const [activeTab, setActiveTab] = useState<'visual' | 'study' | 'productivity'>('visual');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <>
      <SmartphoneFrame
        activeTab={activeTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      >
        {activeTab === 'visual' && (
          <VisualHub
            onNavigateToStudy={() => setActiveTab('study')}
            onNavigateToProductivity={() => setActiveTab('productivity')}
          />
        )}

        {activeTab === 'study' && <StudyDashboard />}

        {activeTab === 'productivity' && (
          <ProductivityHub
            onNavigateToStudy={() => setActiveTab('study')}
          />
        )}
      </SmartphoneFrame>

      {/* Embedded Bottom Navigation inside Phone Viewport */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '432px',
          zIndex: 60
        }}
      >
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadTasksCount={pendingTasksCount}
        />
      </div>

      {/* Settings & Key Drawer Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
