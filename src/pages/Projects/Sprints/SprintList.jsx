import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, Edit, Trash2, Calendar, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import SprintForm from './SprintForm';

/**
 * Sprint List Page
 * 
 * Displays all sprints for a project with CRUD operations.
 * Shows sprint status, dates, velocity, and progress.
 */

const SprintList = () => {
  const { id: projectId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchSprints();
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .single();
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const fetchSprints = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('sprints')
        .select(`
          *,
          project:projects(id, name)
        `)
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      // Calculate sprint metrics
      const sprintsWithMetrics = await Promise.all(
        (data || []).map(async (sprint) => {
          // Count work items in sprint
          const { count: totalItems } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('sprint_id', sprint.id)
            .in('type', ['UserStory', 'Task']);

          // Count completed work items
          const { count: completedItems } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('sprint_id', sprint.id)
            .in('type', ['UserStory', 'Task'])
            .eq('status', 'Done');

          // Calculate actual velocity (story points completed)
          const { data: completedWork } = await supabase
            .from('work_items')
            .select('effort_estimate')
            .eq('sprint_id', sprint.id)
            .eq('status', 'Done')
            .eq('effort_unit', 'StoryPoints');

          const actualVelocity = completedWork?.reduce((sum, item) => sum + (item.effort_estimate || 0), 0) || 0;

          return {
            ...sprint,
            total_items: totalItems || 0,
            completed_items: completedItems || 0,
            actual_velocity: actualVelocity,
            progress_percent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
          };
        })
      );

      setSprints(sprintsWithMetrics);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setError('Failed to load sprints');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSprint(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sprint) => {
    setEditingSprint(sprint);
    setIsFormOpen(true);
  };

  const handleDelete = async (sprint) => {
    if (!window.confirm(`Are you sure you want to delete "${sprint.name}"? This will unassign all work items from this sprint.`)) {
      return;
    }

    try {
      // First, unassign all work items from this sprint
      const { error: unassignError } = await supabase
        .from('work_items')
        .update({ sprint_id: null })
        .eq('sprint_id', sprint.id);

      if (unassignError) throw unassignError;

      // Then delete the sprint
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprint.id);

      if (error) throw error;
      fetchSprints();
    } catch (err) {
      console.error('Error deleting sprint:', err);
      alert('Failed to delete sprint. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    fetchSprints();
    setIsFormOpen(false);
    setEditingSprint(null);
  };

  // Filter sprints
  const filteredSprints = sprints.filter(sprint => {
    const matchesSearch = sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sprint.goal || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Planning': 'bg-gray-100 text-gray-800 border-gray-200',
      'Active': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sprints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchSprints} className="mt-4">Retry</Button>
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
            <h1 className="text-2xl font-semibold text-gray-900">Sprints</h1>
            <p className="text-gray-600 text-sm mt-1">
              {project ? `Manage sprints for ${project.name}` : 'Manage project sprints'}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Create Sprint
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search sprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Sprints Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sprint Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Work Items</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Velocity</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSprints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {sprints.length === 0 
                    ? 'No sprints found. Click "Create Sprint" to get started.'
                    : 'No sprints match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSprints.map((sprint) => {
                const daysRemaining = getDaysRemaining(sprint.end_date);
                const duration = sprint.end_date && sprint.start_date 
                  ? Math.ceil((new Date(sprint.end_date) - new Date(sprint.start_date)) / (1000 * 60 * 60 * 24)) + 1
                  : null;

                return (
                  <TableRow key={sprint.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link
                        to={`/projects/${projectId}/sprints/${sprint.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {sprint.name}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      {sprint.goal && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{sprint.goal}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(sprint.status)}`}>
                        {sprint.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </div>
                        {daysRemaining !== null && sprint.status === 'Active' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {daysRemaining > 0 ? (daysRemaining + ' days left') : daysRemaining === 0 ? 'Ends today' : (Math.abs(daysRemaining) + ' days overdue')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {duration ? duration + ' days' : '—'}
                    </TableCell>
                    <TableCell>
                      {sprint.completed_items} / {sprint.total_items}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: sprint.progress_percent + '%' }}
                        ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {sprint.progress_percent}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {sprint.actual_velocity || 0} / {sprint.velocity || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sprint.velocity ? Math.round((sprint.actual_velocity / sprint.velocity) * 100) : 0}% of goal
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(sprint)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(sprint)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <SprintForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSprint(null);
        }}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        editingSprint={editingSprint}
      />
    </div>
  );
};

export default SprintList;

