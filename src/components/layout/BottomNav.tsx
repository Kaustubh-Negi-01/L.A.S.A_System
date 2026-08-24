import React from 'react';
import { Eye, GraduationCap, Zap } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'visual' | 'study' | 'productivity';
  setActiveTab: (tab: 'visual' | 'study' | 'productivity') => void;
  unreadTasksCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadTasksCount = 0
}) => {
  return (
    <nav className="bottom-nav-bar">
      <button
        className={`nav-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
        onClick={() => setActiveTab('visual')}
      >
        <Eye className="nav-icon" size={20} />
        <span>Understand</span>
        {activeTab === 'visual' && <div className="nav-active-pill" />}
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'study' ? 'active' : ''}`}
        onClick={() => setActiveTab('study')}
      >
        <GraduationCap className="nav-icon" size={20} />
        <span>Study Coach</span>
        {activeTab === 'study' && <div className="nav-active-pill" />}
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'productivity' ? 'active' : ''}`}
        onClick={() => setActiveTab('productivity')}
      >
        <div style={{ position: 'relative' }}>
          <Zap className="nav-icon" size={20} />
          {unreadTasksCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -8,
                background: '#f43f5e',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                borderRadius: '999px',
                padding: '1px 4px',
                lineHeight: 1
              }}
            >
              {unreadTasksCount}
            </span>
          )}
        </div>
        <span>Productivity</span>
        {activeTab === 'productivity' && <div className="nav-active-pill" />}
      </button>
    </nav>
  );
};
