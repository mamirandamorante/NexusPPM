import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Target, BarChart3 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import SprintBurndownChart from './SprintBurndownChart';

/**
 * Sprint Board (Kanban) Page
 * 
 * Displays a Kanban board for an active sprint with columns:
 * - Backlog
 * - To Do
 * - In Progress
 * - In Review
 * - Done
 */

const SprintBoard = () => {
  const { id: projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  const columns = [
    { id: 'Backlog', title: 'Backlog', color: 'bg-gray-100' },
    { id: 'ToDo', title: 'To Do', color: 'bg-blue-100' },
    { id: 'InProgress', title: 'In Progress', color: 'bg-yellow-100' },
    { id: 'InReview', title: 'In Review', color: 'bg-purple-100' },
    { id: 'Done', title: 'Done', color: 'bg-green-100' },
  ];

  useEffect(() => {
    if (sprintId) {
      fetchSprintData();
    }
  }, [sprintId]);

  const fetchSprintData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Sprint
      const { data: sprintData, error: sprintError } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();

      if (sprintError) throw sprintError;
      setSprint(sprintData);

      // Fetch Work Items
      const { data: itemsData, error: itemsError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('sprint_id', sprintId)
        .in('type', ['UserStory', 'Task'])
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setWorkItems(itemsData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching sprint board data:', err);
      setError('Failed to load sprint board');
      setLoading(false);
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('work_items')
        .update({ status: targetStatus })
        .eq('id', draggedItem.id);

      if (error) throw error;

      // Update local state
      setWorkItems(prev => 
        prev.map(item => 
          item.id === draggedItem.id 
            ? { ...item, status: targetStatus }
            : item
        )
      );

      setDraggedItem(null);
    } catch (err) {
      console.error('Error updating work item status:', err);
      alert('Failed to update work item status. Please try again.');
      setDraggedItem(null);
    }
  };

  const getItemsByStatus = (status) => {
    return workItems.filter(item => item.status === status);
  };

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      'UserStory': 'bg-purple-100 text-purple-800 border-purple-200',
      'Task': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return typeMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sprint board...</p>
        </div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Sprint not found'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/sprints/${sprintId}`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sprint
          </Button>
        </div>
      </div>
    );
  }

  if (sprint.status !== 'Active') {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-700">Sprint board is only available for active sprints.</p>
          <p className="text-yellow-600 text-sm mt-2">Current sprint status: {sprint.status}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/sprints/${sprintId}`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sprint
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to={`/projects/${projectId}/sprints/${sprintId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{sprint.name} - Board</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
              </div>
              {sprint.goal && (
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {sprint.goal}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-semibold text-gray-900 mt-1">{workItems.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-semibold text-yellow-600 mt-1">
            {getItemsByStatus('InProgress').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Done</div>
          <div className="text-2xl font-semibold text-green-600 mt-1">
            {getItemsByStatus('Done').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="text-2xl font-semibold text-blue-600 mt-1">
            {workItems.length > 0 
              ? Math.round((getItemsByStatus('Done').length / workItems.length) * 100)
              : 0}%
          </div>
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Sprint Burndown
        </h2>
        <SprintBurndownChart sprintId={sprintId} />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnItems = getItemsByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="bg-gray-50 rounded-lg border border-gray-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`${column.color} px-4 py-3 border-b border-gray-200 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-600 bg-white px-2 py-0.5 rounded">
                    {columnItems.length}
                  </span>
                </div>
              </div>

              {/* Column Items */}
              <div className="p-2 min-h-[400px] max-h-[600px] overflow-y-auto">
                {columnItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No items
                  </div>
                ) : (
                  columnItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadgeClass(item.type)}`}>
                          {item.type === 'UserStory' ? 'US' : 'T'}
                        </span>
                        {item.effort_estimate && (
                          <span className="text-xs text-gray-500">
                            {item.effort_estimate} {item.effort_unit === 'StoryPoints' ? 'SP' : 'h'}
                          </span>
                        )}
                      </div>
                      <Link
                        to={item.type === 'UserStory' 
                          ? `/projects/${projectId}/user-stories/${item.id}`
                          : `/projects/${projectId}/tasks/${item.id}`}
                        className="font-medium text-sm text-gray-900 hover:text-blue-600 block mb-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </Link>
                      {item.assignee_name && (
                        <div className="text-xs text-gray-500 mt-2">
                          👤 {item.assignee_name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Drag and drop work items between columns to update their status.</p>
      </div>
    </div>
  );
};

export default SprintBoard;

