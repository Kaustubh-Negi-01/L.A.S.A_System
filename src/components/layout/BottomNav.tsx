import React from 'react';
import { Eye, GraduationCap, Zap } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'visual' | 'study' | 'productivity';
}

const navItems = [
  { id: 'visual' as const, label: 'Understand', caption: 'Scan & extract', icon: Eye },
  { id: 'study' as const, label: 'Study Coach', caption: 'Plan & practice', icon: GraduationCap },
  { id: 'productivity' as const, label: 'Productivity', caption: 'Tasks & schedule', icon: Zap }
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const activeItem = navItems.find(item => item.id === activeTab) ?? navItems[0];
  const ActiveIcon = activeItem.icon;
  const activeIndex = navItems.findIndex(item => item.id === activeItem.id);

  return (
    <nav className="bottom-nav-bar" aria-label="Current workspace mode">
      <div className="nav-tab-btn nav-current-mode active" aria-current="page" data-mode={activeItem.id}>
        <span className="nav-icon-wrap">
          <ActiveIcon className="nav-icon" size={18} aria-hidden="true" />
        </span>
        <span className="nav-copy">
          <strong>{activeItem.label}</strong>
          <small>{activeItem.caption}</small>
        </span>
        <span className="nav-index">0{activeIndex + 1}</span>
        <span className="nav-active-pill" aria-hidden="true" />
      </div>
    </nav>
  );
};
