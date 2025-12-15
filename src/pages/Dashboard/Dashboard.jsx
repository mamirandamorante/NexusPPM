import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  FolderKanban
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

/**
 * Dashboard Component - Executive Overview
 * 
 * Enhanced dashboard with real data from database:
 * - Executive overview cards (projects, resources, budget)
 * - Recent projects widget
 * - Resource utilization summary
 * - Budget overview
 * - Quick actions
 */

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    atRiskProjects: 0,
    totalResources: 0,
    totalBudget: 0,
    spentBudget: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch project counts
      const [projectsResult, activeProjectsResult, resourcesResult, recentProjectsResult] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }).neq('status', 'Closed'),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('vw_project_overview').select('id, name, status, priority, budget, actual_cost, open_risks, open_issues').order('updated_at', { ascending: false }).limit(5)
      ]);

      // Calculate at-risk projects from recent projects or fetch separately
      let atRiskCount = 0;
      if (recentProjectsResult.data) {
        atRiskCount = recentProjectsResult.data.filter(p => 
          (p.open_risks || 0) > 3 || (p.open_issues || 0) > 5
        ).length;
      }
      
      // If we need more accurate count, fetch all projects
      const allProjectsResult = await supabase
        .from('vw_project_overview')
        .select('id, open_risks, open_issues');
      
      if (allProjectsResult.data) {
        atRiskCount = allProjectsResult.data.filter(p => 
          (p.open_risks || 0) > 3 || (p.open_issues || 0) > 5
        ).length;
      }

      // Calculate budget totals
      const budgetResult = await supabase
        .from('projects')
        .select('budget, actual_cost');

      let totalBudget = 0;
      let spentBudget = 0;
      if (budgetResult.data) {
        budgetResult.data.forEach(project => {
          totalBudget += project.budget || 0;
          spentBudget += project.actual_cost || 0;
        });
      }

      setStats({
        totalProjects: projectsResult.count || 0,
        activeProjects: activeProjectsResult.count || 0,
        atRiskProjects: atRiskCount,
        totalResources: resourcesResult.count || 0,
        totalBudget,
        spentBudget
      });

      setRecentProjects(recentProjectsResult.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kpis = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: '+3',
      trend: 'up',
      subtitle: 'across all portfolios',
      icon: FolderKanban,
      link: '/projects'
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: `+${stats.activeProjects - (stats.totalProjects - stats.activeProjects)}`,
      trend: 'up',
      subtitle: `${stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}% of total`,
      icon: CheckCircle2,
      link: '/projects'
    },
    {
      title: 'At Risk',
      value: stats.atRiskProjects,
      change: '+2',
      trend: 'down',
      subtitle: 'requires attention',
      icon: AlertTriangle,
      link: '/risks'
    },
    {
      title: 'Total Resources',
      value: stats.totalResources,
      change: '+5',
      trend: 'up',
      subtitle: 'team members',
      icon: Users,
      link: '/resources'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Overview of portfolio performance and key metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const content = (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
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

              <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.title}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.subtitle}</div>
            </div>
          );

          return kpi.link ? (
            <Link key={index} to={kpi.link} className="block">
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Financial Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial Overview
          </h2>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Budget</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Spent</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.spentBudget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(Math.max(0, stats.totalBudget - stats.spentBudget))}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {stats.totalBudget > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Budget Utilization</span>
                <span className="font-semibold text-gray-900">
                  {Math.round((stats.spentBudget / stats.totalBudget) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gray-700"
                  style={{ width: `${Math.min(100, (stats.spentBudget / stats.totalBudget) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-gray-700 hover:underline">
              View All
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {project.status} • {project.priority}
                      </div>
                    </div>
                    {project.budget && (
                      <div className="text-xs text-gray-600 ml-2">
                        {formatCurrency(project.budget)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              No projects found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/projects"
            className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
          >
            View Projects
          </Link>
          <Link
            to="/resources"
            className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
          >
            Manage Resources
          </Link>
          <Link
            to="/reports"
            className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
          >
            View Reports
          </Link>
          <Link
            to="/portfolios"
            className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
          >
            Portfolios
          </Link>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

