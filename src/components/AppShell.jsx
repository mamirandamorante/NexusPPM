import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  Rocket,
  AlertTriangle,
  CheckCircle2,
  Users,
  BarChart3,
  Settings,
  Menu,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';
import AIChat from './AIChat';

/**
 * AppShell Component - Portavia Design
 * 
 * Main layout wrapper for the entire application.
 * 
 * Features:
 * - Light grey header with logo, search, notifications, AI button, user menu
 * - Light grey left sidebar with navigation (collapsible)
 * - Light grey right sidebar with AI Chat (collapsible)
 * - White main content area
 * - Fine black borders throughout
 * - Professional black/white/grey color scheme
 */

const AppShell = ({ children, breadcrumbs = [] }) => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const location = useLocation();

  // Navigation items with icons and badges
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { icon: FolderKanban, label: 'Portfolios', path: '/portfolios', badge: null },
    { icon: Target, label: 'Programs', path: '/programs', badge: null },
    { icon: Rocket, label: 'Projects', path: '/projects', badge: null },
    { icon: AlertTriangle, label: 'Risks & Issues', path: '/risks', badge: null },
    { icon: CheckCircle2, label: 'Milestones', path: '/milestones', badge: null },
    { icon: Users, label: 'Resources', path: '/resources', badge: null },
    { icon: BarChart3, label: 'Reports', path: '/reports', badge: null },
  ];

  // Check if a route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Light Grey Background */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-portavia-grey border-b border-portavia-border z-30">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Menu Toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-portavia-dark" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold text-portavia-dark tracking-tight">
                Portavia
              </span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, risks, people..."
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-portavia-border rounded text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Right: Notifications + AI + User */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-200 rounded transition-colors">
              <Bell className="w-5 h-5 text-portavia-dark" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-red rounded-full"></span>
            </button>

            {/* AI Assistant Toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`p-2 hover:bg-gray-200 rounded transition-colors ${
                rightSidebarOpen ? 'bg-gray-200' : ''
              }`}
              title="AI Assistant"
              aria-label="Toggle AI Assistant"
            >
              <Sparkles className="w-5 h-5 text-portavia-dark" />
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 p-2 hover:bg-gray-200 rounded transition-colors">
              <div className="w-7 h-7 bg-portavia-dark rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-xs">MG</span>
              </div>
              <span className="text-sm font-medium text-portavia-dark">Miguel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Light Grey Background */}
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-portavia-grey border-r border-portavia-border transition-all duration-300 z-20 ${
          leftSidebarOpen ? 'w-56' : 'w-14'
        }`}
      >
        <nav className="p-2 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${
                  isActive
                    ? 'bg-white text-portavia-dark font-medium border border-portavia-border'
                    : 'text-gray-600 hover:bg-white hover:border hover:border-portavia-border'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {leftSidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-status-red text-white text-xs font-semibold rounded">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-portavia-border">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white hover:border hover:border-portavia-border rounded transition-all">
            <Settings className="w-4 h-4 flex-shrink-0" />
            {leftSidebarOpen && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Right Sidebar - AI Chat Panel */}
      <aside
        className={`fixed top-14 right-0 bottom-0 bg-portavia-grey border-l border-portavia-border transition-all duration-300 z-20 ${
          rightSidebarOpen ? 'w-96' : 'w-0'
        }`}
        style={{ overflow: rightSidebarOpen ? 'visible' : 'hidden' }}
      >
        <AIChat
          isOpen={rightSidebarOpen}
          onClose={() => setRightSidebarOpen(false)}
        />
      </aside>

      {/* Main Content - White Background */}
      <main
        className={`pt-14 transition-all duration-300 ${
          leftSidebarOpen ? 'pl-56' : 'pl-14'
        } ${rightSidebarOpen ? 'pr-96' : 'pr-0'}`}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="bg-white border-b border-portavia-border px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? 'text-portavia-dark font-medium'
                        : 'text-gray-500 hover:text-portavia-dark cursor-pointer'
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6 bg-white">{children}</div>
      </main>
    </div>
  );
};

export default AppShell;
