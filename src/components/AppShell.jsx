import React, { useState } from 'react';
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
  X,
  Search,
  Bell,
  ChevronLeft
} from 'lucide-react';

/**
 * AppShell Component
 * 
 * This is the main layout wrapper for the entire application.
 * It provides:
 * - Top header with logo, search, and user menu
 * - Left sidebar with navigation (collapsible)
 * - Main content area
 * - Breadcrumbs
 * 
 * Usage:
 * <AppShell breadcrumbs={['Dashboard']}>
 *   <YourPageContent />
 * </AppShell>
 */

const AppShell = ({ children, breadcrumbs = [] }) => {
  // State for sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Navigation items with icons and badges
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { icon: FolderKanban, label: 'Portfolios', path: '/portfolios', badge: null },
    { icon: Target, label: 'Programs', path: '/programs', badge: null },
    { icon: Rocket, label: 'Projects', path: '/projects', badge: 3 },
    { icon: AlertTriangle, label: 'Risks & Issues', path: '/risks', badge: 5 },
    { icon: CheckCircle2, label: 'Milestones', path: '/milestones', badge: null },
    { icon: Users, label: 'Resources', path: '/resources', badge: null },
    { icon: BarChart3, label: 'Reports', path: '/reports', badge: null },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-slate-900">NexusPPM</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, risks, people..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-sm">MG</span>
              </div>
              <span className="text-sm font-medium text-slate-700">Miguel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-slate-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 0; // Mock active state for Dashboard
            
            return (
              <button
                key={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </button>
          
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 text-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Collapse
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="bg-white border-b border-slate-200 px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="text-slate-400">/</span>
                  )}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? 'text-slate-900 font-medium'
                        : 'text-slate-500 hover:text-slate-700 cursor-pointer'
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
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
