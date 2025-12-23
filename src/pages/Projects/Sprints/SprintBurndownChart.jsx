import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/**
 * Sprint Burndown Chart Component
 * 
 * Displays a burndown chart showing remaining work vs time for a sprint.
 */

const SprintBurndownChart = ({ sprintId }) => {
  const [burndownData, setBurndownData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sprintId) {
      fetchBurndownData();
    }
  }, [sprintId]);

  const fetchBurndownData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('vw_sprint_burndown')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('day', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform data for chart
      const chartData = (data || []).map(item => ({
        date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day: item.day,
        remaining: item.remaining_effort || 0,
        ideal: item.ideal_remaining_effort || 0,
        completed: item.completed_effort || 0,
      }));

      setBurndownData(chartData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching burndown data:', err);
      setError('Failed to load burndown data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading burndown chart...</p>
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

  if (burndownData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 text-sm">No burndown data available for this sprint.</p>
          <p className="text-gray-400 text-xs mt-1">Add work items to the sprint to see the burndown chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
          <ReferenceLine 
            y={0} 
            stroke="#9ca3af" 
            strokeDasharray="2 2" 
          />
          <Line 
            type="monotone" 
            dataKey="ideal" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Ideal Burndown"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="remaining" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Actual Remaining"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Shows remaining story points over time. The ideal line represents a linear burndown.</p>
      </div>
    </div>
  );
};

export default SprintBurndownChart;

