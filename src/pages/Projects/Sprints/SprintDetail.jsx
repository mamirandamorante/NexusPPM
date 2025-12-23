import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Trash2, Calendar, Target, BarChart3, Kanban, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import SprintForm from './SprintForm';
import SprintBacklogForm from './SprintBacklogForm';
import SprintBurndownChart from './SprintBurndownChart';

/**
 * Sprint Detail Page
 * 
 * Shows detailed information about a Sprint including:
 * - Sprint information
 * - Sprint backlog (work items)
 * - Burndown chart
 * - Progress metrics
 */

const SprintDetail = () => {
  const { id: projectId, sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [backlogItems, setBacklogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBacklogFormOpen, setIsBacklogFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
        .select(`
          *,
          project:projects(id, name),
          prince2_stage:prince2_stages(id, stage_name, stage_number)
        `)
        .eq('id', sprintId)
        .single();

      if (sprintError) throw sprintError;
      setSprint(sprintData);

      // Fetch Backlog Items
      const { data: backlogData, error: backlogError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('sprint_id', sprintId)
        .in('type', ['UserStory', 'Task'])
        .order('type', { ascending: true })
        .order('created_at', { ascending: false });

      if (backlogError) throw backlogError;
      setBacklogItems(backlogData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching sprint data:', err);
      setError('Failed to load sprint details');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsFormOpen(true);
  };

  const handleAddToBacklog = () => {
    setEditingItem(null);
    setIsBacklogFormOpen(true);
  };

  const handleRemoveFromBacklog = async (item) => {
    if (!window.confirm(`Remove "${item.title}" from this sprint?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('work_items')
        .update({ sprint_id: null })
        .eq('id', item.id);

      if (error) throw error;
      fetchSprintData();
    } catch (err) {
      console.error('Error removing item from backlog:', err);
      alert('Failed to remove item from backlog. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    fetchSprintData();
    setIsFormOpen(false);
  };

  const handleBacklogFormSuccess = () => {
    fetchSprintData();
    setIsBacklogFormOpen(false);
    setEditingItem(null);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Backlog': 'bg-gray-100 text-gray-800 border-gray-200',
      'ToDo': 'bg-blue-100 text-blue-800 border-blue-200',
      'InProgress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'InReview': 'bg-purple-100 text-purple-800 border-purple-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Calculate sprint metrics
  const totalItems = backlogItems.length;
  const completedItems = backlogItems.filter(item => item.status === 'Done').length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  const totalStoryPoints = backlogItems
    .filter(item => item.effort_unit === 'StoryPoints')
    .reduce((sum, item) => sum + (item.effort_estimate || 0), 0);
  const completedStoryPoints = backlogItems
    .filter(item => item.effort_unit === 'StoryPoints' && item.status === 'Done')
    .reduce((sum, item) => sum + (item.effort_estimate || 0), 0);
  const actualVelocity = completedStoryPoints;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sprint details...</p>
        </div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Sprint not found'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/sprints`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sprints
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
              <Link to={`/projects/${projectId}/sprints`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{sprint.name}</h1>
            </div>
            <p className="text-gray-600 text-sm">Sprint Details and Backlog</p>
          </div>
          <div className="flex items-center gap-2">
            {sprint.status === 'Active' && (
              <Link to={`/projects/${projectId}/sprints/${sprintId}/board`}>
                <Button>
                  <Kanban className="w-4 h-4 mr-2" />
                  View Board
                </Button>
              </Link>
            )}
            <Link to={`/projects/${projectId}/sprints/${sprintId}/retrospective`}>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Retrospective
              </Button>
            </Link>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Sprint
            </Button>
          </div>
        </div>
      </div>

      {/* Sprint Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                sprint.status === 'Active' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                sprint.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                sprint.status === 'Planning' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {sprint.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Dates</label>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-900">
              <Calendar className="w-4 h-4" />
              {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
            </div>
          </div>
          {sprint.goal && (
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Sprint Goal</label>
              <p className="text-sm text-gray-900 mt-1">{sprint.goal}</p>
            </div>
          )}
          {sprint.prince2_stage && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">PRINCE2 Stage</label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {sprint.prince2_stage.stage_name} - Stage {sprint.prince2_stage.stage_number}
              </p>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Velocity</label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {actualVelocity} / {sprint.velocity || 0} Story Points
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Progress</label>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: progressPercent + '%' }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Work Items</label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {completedItems} / {totalItems} completed
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Burndown Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Sprint Burndown
          </h2>
          <SprintBurndownChart sprintId={sprintId} />
        </div>

        {/* Velocity Link */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Project Velocity
          </h2>
          <div className="flex items-center justify-center h-64">
            <Link to={`/projects/${projectId}/sprints/${sprintId}/velocity`}>
              <Button variant="outline" size="lg">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Velocity Trends
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sprint Backlog */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sprint Backlog ({backlogItems.length})</h2>
          <Button onClick={handleAddToBacklog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Work Item
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Effort</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backlogItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No work items in this sprint. Click "Add Work Item" to add items to the backlog.
                </TableCell>
              </TableRow>
            ) : (
              backlogItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getTypeBadgeClass(item.type)}`}>
                      {item.type === 'UserStory' ? 'User Story' : 'Task'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={item.type === 'UserStory' 
                        ? `/projects/${projectId}/user-stories/${item.id}`
                        : `/projects/${projectId}/tasks/${item.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {item.title}
                    </Link>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.assignee_name || 'Unassigned'}</TableCell>
                  <TableCell>
                    {item.effort_estimate 
                      ? item.effort_estimate + ' ' + (item.effort_unit === 'StoryPoints' ? 'SP' : 'h')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: (item.completion_percent || 0) + '%' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {item.completion_percent || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleRemoveFromBacklog(item)}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                      title="Remove from Sprint"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sprint Form Dialog */}
      <SprintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        editingSprint={sprint}
      />

      {/* Backlog Form Dialog */}
      <SprintBacklogForm
        isOpen={isBacklogFormOpen}
        onClose={() => {
          setIsBacklogFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleBacklogFormSuccess}
        projectId={projectId}
        sprintId={sprintId}
      />
    </div>
  );
};

export default SprintDetail;

