import React from 'react';
import { Eye, GraduationCap, Zap } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'visual' | 'study' | 'productivity';
  setActiveTab: (tab: 'visual' | 'study' | 'productivity') => void;
  unreadTasksCount?: number;
}

const navItems = [
  { id: 'visual' as const, label: 'Understand', caption: 'Scan & extract', icon: Eye },
  { id: 'study' as const, label: 'Study Coach', caption: 'Plan & practice', icon: GraduationCap },
  { id: 'productivity' as const, label: 'Productivity', caption: 'Tasks & schedule', icon: Zap }
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadTasksCount = 0
}) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Primary workspace navigation">
      {navItems.map(({ id, label, caption, icon: Icon }, index) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon-wrap">
              <Icon className="nav-icon" size={18} />
              {id === 'productivity' && unreadTasksCount > 0 && (
                <span className="nav-count" aria-label={`${unreadTasksCount} open tasks`}>
                  {unreadTasksCount}
                </span>
              )}
            </span>
            <span className="nav-copy">
              <strong>{label}</strong>
              <small>{caption}</small>
            </span>
            <span className="nav-index">0{index + 1}</span>
            {isActive && <span className="nav-active-pill" />}
          </button>
        );
      })}
    </nav>
  );
};
