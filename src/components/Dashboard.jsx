import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import AppShell from './AppShell';

/**
 * Dashboard Component
 * 
 * Main landing page showing executive overview:
 * - KPI cards with key metrics
 * - Portfolio health visualization
 * - Financial overview
 * - Critical alerts (issues and risks)
 * - Upcoming milestones
 * 
 * This is the first page users see after login.
 */

const Dashboard = () => {
  // Mock KPI data
  const kpis = [
    {
      title: 'Total Projects',
      value: '20',
      change: '+3',
      trend: 'up',
      subtitle: 'from last month',
      icon: CheckCircle2,
      color: 'indigo'
    },
    {
      title: 'Active Projects',
      value: '15',
      change: '+2',
      trend: 'up',
      subtitle: '75% of total',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'At Risk',
      value: '5',
      change: '+2',
      trend: 'down',
      subtitle: 'requires attention',
      icon: AlertCircle,
      color: 'amber'
    },
    {
      title: 'Overdue Items',
      value: '7',
      change: '-3',
      trend: 'up',
      subtitle: 'milestones + tasks',
      icon: Clock,
      color: 'red'
    }
  ];

  // Mock portfolio health data
  const portfolioHealth = [
    { status: 'On Track', count: 12, percentage: 60, color: 'bg-emerald-500' },
    { status: 'At Risk', count: 6, percentage: 30, color: 'bg-amber-500' },
    { status: 'Critical', count: 2, percentage: 10, color: 'bg-red-500' }
  ];

  // Mock critical issues
  const criticalIssues = [
    { title: 'Push notifications service down', project: 'Mobile App', severity: 'Critical' },
    { title: 'Payroll configuration error', project: 'HR System', severity: 'Critical' },
    { title: 'Data validation failing', project: 'Finance Migration', severity: 'High' },
    { title: 'Image loading performance poor', project: 'Website Redesign', severity: 'High' },
    { title: 'Login timeout issues', project: 'Customer Portal', severity: 'High' }
  ];

  // Mock high risks
  const highRisks = [
    { title: 'Economic downturn may impact funding', level: 'Portfolio', score: 20 },
    { title: 'Legacy system integration complexity', level: 'Program', score: 20 },
    { title: 'Shared UX resources over-allocated', level: 'Program', score: 16 },
    { title: 'Data quality issues for ML models', level: 'Program', score: 16 }
  ];

  // Mock upcoming milestones
  const upcomingMilestones = [
    { name: 'Design System Ready', project: 'Website Redesign', date: 'Dec 20', status: 'at-risk' },
    { name: 'Development 50% Complete', project: 'Mobile App', date: 'Jan 5', status: 'on-track' },
    { name: 'Data Migration Complete', project: 'HR System', date: 'Jan 15', status: 'on-track' },
    { name: 'UAT Passed', project: 'HR System', date: 'Jan 31', status: 'planned' }
  ];

  return (
    <AppShell breadcrumbs={['Dashboard']}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of portfolio performance and key metrics</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Executive View</option>
          <option>My Projects</option>
          <option>Portfolio View</option>
          <option>Program View</option>
        </select>
        
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>This Year</option>
          <option>Custom Range</option>
        </select>

        <button className="ml-auto px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors">
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses = {
            indigo: 'bg-indigo-50 text-indigo-600',
            green: 'bg-emerald-50 text-emerald-600',
            amber: 'bg-amber-50 text-amber-600',
            red: 'bg-red-50 text-red-600'
          };

          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${colorClasses[kpi.color]} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {kpi.change}
                </div>
              </div>
              
              <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-slate-500">{kpi.title}</div>
              <div className="text-xs text-slate-400 mt-1">{kpi.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Portfolio Health</h2>
          
          {/* Visual Bar */}
          <div className="flex h-8 rounded-lg overflow-hidden mb-6">
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
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-slate-700">{item.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{item.count} projects</span>
                  <span className="text-xs text-slate-500">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Financial Overview</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Budget</span>
              <span className="text-xl font-bold text-slate-900">$13,000,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Spent</span>
              <span className="text-xl font-bold text-indigo-600">$6,900,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Remaining</span>
              <span className="text-xl font-bold text-emerald-600">$6,100,000</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">Budget Utilization</span>
              <span className="font-semibold text-slate-900">53%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" style={{ width: '53%' }}></div>
            </div>
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            View Detailed Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Critical Issues */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Critical Issues
              <span className="text-sm font-normal text-slate-500">({criticalIssues.length})</span>
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {criticalIssues.map((issue, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{issue.title}</div>
                    <div className="text-xs text-slate-600 mt-1">{issue.project}</div>
                  </div>
                  <span className="text-xs font-semibold text-red-600 px-2 py-1 bg-red-100 rounded">
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Risks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              High Risks
              <span className="text-sm font-normal text-slate-500">({highRisks.length})</span>
            </h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {highRisks.map((risk, index) => (
              <div key={index} className="p-3 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{risk.title}</div>
                    <div className="text-xs text-slate-600 mt-1">{risk.level} Level</div>
                  </div>
                  <div className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                    Score: {risk.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Milestones</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View Timeline
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingMilestones.map((milestone, index) => {
            const statusColors = {
              'on-track': 'border-emerald-200 bg-emerald-50',
              'at-risk': 'border-amber-200 bg-amber-50',
              'planned': 'border-slate-200 bg-slate-50'
            };

            const statusDots = {
              'on-track': 'bg-emerald-500',
              'at-risk': 'bg-amber-500',
              'planned': 'bg-slate-400'
            };

            return (
              <div key={index} className={`p-4 border rounded-lg ${statusColors[milestone.status]} hover:shadow-md transition-shadow cursor-pointer`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${statusDots[milestone.status]}`}></div>
                  <span className="text-xs font-semibold text-slate-600 uppercase">{milestone.date}</span>
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-2">{milestone.name}</div>
                <div className="text-xs text-slate-600">{milestone.project}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
