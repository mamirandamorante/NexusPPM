import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppShell from './AppShell';

/**
 * Layout Component
 * Wraps all routes with AppShell and provides breadcrumbs based on route
 */
const Layout = () => {
  const location = useLocation();
  
  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') {
      return ['Dashboard'];
    }
    
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = ['Dashboard'];
    
    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (isLast) {
        breadcrumbs.push(label);
      }
    });
    
    return breadcrumbs;
  };

  return (
    <AppShell breadcrumbs={getBreadcrumbs()}>
      <Outlet />
    </AppShell>
  );
};

export default Layout;

