import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  ReferenceLine,
} from 'recharts';

/**
 * Sprint Velocity Component
 * 
 * Displays velocity trends for a project showing:
 * - Planned vs Actual velocity per sprint
 * - Rolling average velocity
 * - Velocity trend over time
 */

const SprintVelocity = ({ projectId: propProjectId }) => {
  const { id: routeProjectId, sprintId } = useParams();
  const projectId = propProjectId || routeProjectId;
  const [velocityData, setVelocityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchVelocityData();
    }
  }, [projectId]);

  const fetchVelocityData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vw_project_velocity')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform data for chart
      const chartData = (data || []).map(item => ({
        sprint: item.sprint_name || `Sprint ${item.sprint_id.substring(0, 8)}`,
        sprintId: item.sprint_id,
        planned: item.planned_velocity || 0,
        actual: item.actual_velocity || 0,
        rollingAvg: item.rolling_avg_velocity || 0,
        completedItems: item.completed_items || 0,
        startDate: item.start_date,
        endDate: item.end_date,
      }));

      setVelocityData(chartData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching velocity data:', err);
      setError('Failed to load velocity data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading velocity data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (velocityData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-sm">No velocity data available.</p>
          <p className="text-gray-400 text-xs mt-1">Complete some sprints to see velocity trends.</p>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalSprints = velocityData.length;
  const avgPlanned = velocityData.reduce((sum, item) => sum + item.planned, 0) / totalSprints;
  const avgActual = velocityData.reduce((sum, item) => sum + item.actual, 0) / totalSprints;
  const latestRollingAvg = velocityData[velocityData.length - 1]?.rollingAvg || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {sprintId && (
        <div className="mb-6">
          <Link to={`/projects/${projectId}/sprints/${sprintId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sprint
            </Button>
          </Link>
        </div>
      )}
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Sprints</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{totalSprints}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Avg Planned</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">{avgPlanned.toFixed(1)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Avg Actual</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">{avgActual.toFixed(1)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Rolling Avg (3)</div>
          <div className="text-2xl font-semibold text-purple-600 mt-1">{latestRollingAvg.toFixed(1)}</div>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Velocity Trend</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="sprint" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Story Points', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="planned" fill="#93c5fd" name="Planned Velocity" />
              <Bar dataKey="actual" fill="#10b981" name="Actual Velocity" />
              <Line 
                type="monotone" 
                dataKey="rollingAvg" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Rolling Avg (3 sprints)"
                dot={{ r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Velocity Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Sprint Velocity Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sprint</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolling Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Done</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {velocityData.map((item, index) => {
                const variance = item.actual - item.planned;
                const variancePercent = item.planned > 0 ? ((variance / item.planned) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={item.sprintId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sprint}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.planned}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.actual}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {variance >= 0 ? '+' : ''}{variance.toFixed(1)} ({variancePercent >= 0 ? '+' : ''}{variancePercent}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.rollingAvg > 0 ? item.rollingAvg.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.completedItems}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SprintVelocity;

