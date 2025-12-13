import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import AppShell from './AppShell';

/**
 * Dashboard Component - Portavia Design
 * 
 * Executive dashboard showing portfolio overview with:
 * - KPI cards with key metrics
 * - Portfolio health visualization (green/orange/red bars)
 * - Financial overview with budget tracking
 * - Critical issues list (red flags)
 * - Upcoming milestones with status indicators
 * 
 * Design:
 * - Clean black/white/grey color scheme
 * - Status colors (red/orange/green) for flags only
 * - Professional, sophisticated layout
 * - Inspired by OnePlan's clean design
 */

const Dashboard = () => {
  // KPI data
  const kpis = [
    {
      title: 'Total Projects',
      value: '20',
      change: '+3',
      trend: 'up',
      subtitle: 'from last month',
      icon: CheckCircle2
    },
    {
      title: 'Active Projects',
      value: '15',
      change: '+2',
      trend: 'up',
      subtitle: '75% of total',
      icon: TrendingUp
    },
    {
      title: 'At Risk',
      value: '5',
      change: '+2',
      trend: 'down',
      subtitle: 'requires attention',
      icon: AlertTriangle
    },
    {
      title: 'Overdue Items',
      value: '7',
      change: '-3',
      trend: 'up',
      subtitle: 'milestones + tasks',
      icon: Clock
    }
  ];

  // Portfolio health data
  const portfolioHealth = [
    { status: 'On Track', count: 12, percentage: 60, color: 'bg-status-green' },
    { status: 'At Risk', count: 6, percentage: 30, color: 'bg-status-orange' },
    { status: 'Critical', count: 2, percentage: 10, color: 'bg-status-red' }
  ];

  // Critical issues
  const criticalIssues = [
    { title: 'Push notifications service down', project: 'Mobile App', severity: 'Critical' },
    { title: 'Payroll configuration error', project: 'HR System', severity: 'Critical' },
    { title: 'Data validation failing', project: 'Finance Migration', severity: 'High' },
    { title: 'Image loading performance poor', project: 'Website Redesign', severity: 'High' },
    { title: 'Login timeout issues', project: 'Customer Portal', severity: 'High' }
  ];

  // Upcoming milestones
  const upcomingMilestones = [
    { name: 'Design System Ready', project: 'Website Redesign', date: 'Dec 20', status: 'at-risk' },
    { name: 'Development 50% Complete', project: 'Mobile App', date: 'Jan 5', status: 'on-track' },
    { name: 'Data Migration Complete', project: 'HR System', date: 'Jan 15', status: 'on-track' },
    { name: 'UAT Passed', project: 'HR System', date: 'Jan 31', status: 'planned' }
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-portavia-dark">Executive Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Overview of portfolio performance and key metrics
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select className="px-3 py-1.5 bg-white border border-portavia-border rounded text-sm focus:outline-none focus:border-gray-400">
          <option>Executive View</option>
          <option>My Projects</option>
          <option>Portfolio View</option>
          <option>Program View</option>
        </select>

        <select className="px-3 py-1.5 bg-white border border-portavia-border rounded text-sm focus:outline-none focus:border-gray-400">
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>This Year</option>
          <option>Custom Range</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <div
              key={index}
              className="bg-white border border-portavia-border rounded p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-portavia-grey rounded flex items-center justify-center">
                  <Icon className="w-5 h-5 text-portavia-dark" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    kpi.trend === 'up' ? 'text-status-green' : 'text-status-red'
                  }`}
                >
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.change}
                </div>
              </div>

              <div className="text-2xl font-bold text-portavia-dark mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.title}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Health */}
        <div className="bg-white border border-portavia-border rounded p-5">
          <h2 className="text-base font-semibold text-portavia-dark mb-5">
            Portfolio Health
          </h2>

          {/* Visual Bar */}
          <div className="flex h-8 rounded overflow-hidden mb-5">
            {portfolioHealth.map((item, index) => (
              <div
                key={index}
                className={`${item.color} flex items-center justify-center text-white text-xs font-semibold`}
                style={{ width: `${item.percentage}%` }}
              >
                {item.percentage}%
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {portfolioHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-portavia-dark">
                    {item.count} projects
                  </span>
                  <span className="text-xs text-gray-500">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white border border-portavia-border rounded p-5">
          <h2 className="text-base font-semibold text-portavia-dark mb-5">
            Financial Overview
          </h2>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-lg font-bold text-portavia-dark">$13,000,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Spent</span>
              <span className="text-lg font-bold text-portavia-dark">$6,900,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-lg font-bold text-status-green">$6,100,000</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Budget Utilization</span>
              <span className="font-semibold text-portavia-dark">53%</span>
            </div>
            <div className="h-2 bg-portavia-grey rounded overflow-hidden">
              <div
                className="h-full bg-portavia-dark"
                style={{ width: '53%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Critical Issues */}
        <div className="bg-white border border-portavia-border rounded p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-portavia-dark flex items-center gap-2">
              <span className="w-2 h-2 bg-status-red rounded-full"></span>
              Critical Issues
              <span className="text-sm font-normal text-gray-500">
                ({criticalIssues.length})
              </span>
            </h2>
            <button className="text-sm text-portavia-dark hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {criticalIssues.map((issue, index) => (
              <div
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-red flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-portavia-dark truncate">
                      {issue.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{issue.project}</div>
                  </div>
                  <span className="text-xs font-semibold text-status-red px-2 py-0.5 bg-red-100 rounded whitespace-nowrap">
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white border border-portavia-border rounded p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-portavia-dark">
              Upcoming Milestones
            </h2>
            <button className="text-sm text-portavia-dark hover:underline">
              View Timeline
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {upcomingMilestones.map((milestone, index) => {
              const statusConfig = {
                'on-track': {
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  dot: 'bg-status-green'
                },
                'at-risk': {
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  dot: 'bg-status-orange'
                },
                planned: {
                  bg: 'bg-gray-50',
                  border: 'border-gray-200',
                  dot: 'bg-gray-400'
                }
              };
              const config = statusConfig[milestone.status];

              return (
                <div
                  key={index}
                  className={`p-3 ${config.bg} border ${config.border} rounded hover:shadow-sm transition-shadow cursor-pointer`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                    <span className="text-xs font-semibold text-gray-600">
                      {milestone.date}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-portavia-dark mb-1">
                    {milestone.name}
                  </div>
                  <div className="text-xs text-gray-600">{milestone.project}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
