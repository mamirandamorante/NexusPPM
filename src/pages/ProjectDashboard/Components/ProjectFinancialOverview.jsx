import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * PROJECT FINANCIAL OVERVIEW COMPONENT
 * 
 * Simple financial overview showing:
 * - Budget vs Actual Cost
 * - Cost breakdown by category
 * - Remaining budget
 * - Budget utilization
 */

const ProjectFinancialOverview = ({ projectId }) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch project data with cost breakdown
      const [overviewResult, costResult] = await Promise.all([
        supabase
          .from('vw_project_overview')
          .select('*')
          .eq('id', projectId)
          .single(),
        
        supabase
          .from('projects')
          .select('budget, actual_cost, actual_cost_labor, actual_cost_materials, actual_cost_infrastructure, actual_cost_other')
          .eq('id', projectId)
          .single()
      ]);

      if (overviewResult.error && overviewResult.error.code !== 'PGRST116') {
        console.error('Error fetching project overview:', overviewResult.error);
      }

      if (costResult.error && costResult.error.code !== 'PGRST116') {
        console.error('Error fetching cost data:', costResult.error);
      }

      // Merge data from both queries
      const mergedData = {
        ...(overviewResult.data || {}),
        ...(costResult.data || {})
      };

      setProjectData(mergedData);
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to load financial data');
      setLoading(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const formatCurrency = (amount) => {
    if (amount == null) return '$0';
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatCurrencyFull = (amount) => {
    if (amount == null) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value) => {
    if (value == null || isNaN(value)) return '0%';
    return `${Number(value).toFixed(1)}%`;
  };

  // ============================================
  // CHART DATA PREPARATION
  // ============================================

  const getBudgetComparisonData = () => {
    if (!projectData) return [];
    return [
      { name: 'Budget', value: projectData.budget || 0 },
      { name: 'Actual', value: projectData.actual_cost || 0 }
    ];
  };

  const getCostBreakdownData = () => {
    if (!projectData) return [];
    const labor = projectData.actual_cost_labor || 0;
    const materials = projectData.actual_cost_materials || 0;
    const infrastructure = projectData.actual_cost_infrastructure || 0;
    const other = projectData.actual_cost_other || 0;
    const total = projectData.actual_cost || 0;

    // If no breakdown available, return empty
    if (labor === 0 && materials === 0 && infrastructure === 0 && other === 0) {
      return [];
    }

    return [
      { name: 'Labor', value: labor, color: '#4b5563' },
      { name: 'Materials', value: materials, color: '#6366f1' },
      { name: 'Infrastructure', value: infrastructure, color: '#8b5cf6' },
      { name: 'Other', value: other, color: '#a855f7' }
    ].filter(item => item.value > 0);
  };

  const getRemainingBudget = () => {
    if (!projectData) return 0;
    return Math.max(0, (projectData.budget || 0) - (projectData.actual_cost || 0));
  };

  const getBudgetUtilization = () => {
    if (!projectData || !projectData.budget || projectData.budget === 0) return 0;
    return ((projectData.actual_cost || 0) / projectData.budget) * 100;
  };

  // ============================================
  // CUSTOM TOOLTIPS
  // ============================================

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrencyFull(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = getCostBreakdownData().reduce((sum, item) => sum + item.value, 0);
      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrencyFull(data.value)}</p>
          <p className="text-xs text-gray-500 mt-1">{percent}% of total costs</p>
        </div>
      );
    }
    return null;
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (!projectId) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-10 bg-gray-700"></div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-6 h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-700 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            Project Financial Overview
          </h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          <p>No financial data available.</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  const budgetComparisonData = getBudgetComparisonData();
  const costBreakdownData = getCostBreakdownData();
  const remainingBudget = getRemainingBudget();
  const budgetUtilization = getBudgetUtilization();
  const isOverBudget = (projectData.actual_cost || 0) > (projectData.budget || 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Dark Header */}
      <div className="bg-gray-700 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
          Project Financial Overview
        </h3>
      </div>

      <div className="p-6">
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Budget vs Actual Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Budget vs Actual Cost</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparisonData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={formatCurrency}
                    stroke="#9ca3af"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#4b5563"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</h4>
            {costBreakdownData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">No cost breakdown available</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Financial Summary</h4>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Budget */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Total Budget</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(projectData.budget)}
              </div>
            </div>

            {/* Actual Cost */}
            <div className={`rounded-lg p-4 border ${
              isOverBudget ? 'bg-red-50 border-red-200' :
              budgetUtilization > 85 ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Actual Cost</div>
              <div className={`text-xl font-bold ${
                isOverBudget ? 'text-red-700' :
                budgetUtilization > 85 ? 'text-orange-700' :
                'text-gray-900'
              }`}>
                {formatCurrency(projectData.actual_cost)}
              </div>
            </div>

            {/* Remaining Budget */}
            <div className={`rounded-lg p-4 border ${
              remainingBudget < 0 ? 'bg-red-50 border-red-200' :
              remainingBudget < (projectData.budget || 0) * 0.15 ? 'bg-orange-50 border-orange-200' :
              'bg-green-50 border-green-100'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className={`text-xl font-bold ${
                remainingBudget < 0 ? 'text-red-700' :
                remainingBudget < (projectData.budget || 0) * 0.15 ? 'text-orange-700' :
                'text-green-700'
              }`}>
                {formatCurrency(remainingBudget)}
              </div>
            </div>

            {/* Budget Utilization */}
            <div className={`rounded-lg p-4 border ${
              budgetUtilization > 100 ? 'bg-red-50 border-red-200' :
              budgetUtilization > 85 ? 'bg-orange-50 border-orange-200' :
              'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-xs text-gray-500 mb-1">Budget Used</div>
              <div className={`text-xl font-bold ${
                budgetUtilization > 100 ? 'text-red-700' :
                budgetUtilization > 85 ? 'text-orange-700' :
                'text-gray-900'
              }`}>
                {formatPercent(budgetUtilization)}
              </div>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          {costBreakdownData.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2.5 px-4 font-medium text-gray-700">Cost Category</th>
                    <th className="text-right py-2.5 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-right py-2.5 px-4 font-medium text-gray-700">% of Total</th>
                    <th className="text-right py-2.5 px-4 font-medium text-gray-700">% of Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costBreakdownData.map((item) => {
                    const totalCost = projectData.actual_cost || 0;
                    const budget = projectData.budget || 0;
                    const percentOfTotal = totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0;
                    const percentOfBudget = budget > 0 ? ((item.value / budget) * 100).toFixed(1) : 0;
                    
                    return (
                      <tr key={item.name}>
                        <td className="py-2.5 px-4 text-gray-900 font-medium">{item.name}</td>
                        <td className="py-2.5 px-4 text-right text-gray-900">{formatCurrencyFull(item.value)}</td>
                        <td className="py-2.5 px-4 text-right text-gray-600">{percentOfTotal}%</td>
                        <td className="py-2.5 px-4 text-right text-gray-600">{percentOfBudget}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td className="py-2.5 px-4 text-gray-900">Total</td>
                    <td className="py-2.5 px-4 text-right text-gray-900">
                      {formatCurrencyFull(projectData.actual_cost)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-900">100%</td>
                    <td className="py-2.5 px-4 text-right text-gray-900">
                      {formatPercent(budgetUtilization)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectFinancialOverview;

