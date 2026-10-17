import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  return (
    <div className="mg-shell">
      {/* Accessibility: skip to main content */}
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="mg-main-content">
        <Header onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        <main id="main-content" className="mg-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
