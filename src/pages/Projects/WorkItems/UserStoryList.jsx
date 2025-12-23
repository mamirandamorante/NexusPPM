import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, Edit, Trash2, ArrowLeft } from 'lucide-react';
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
import WorkItemForm from './WorkItemForm';

/**
 * User Story List Page
 * 
 * Displays all User Stories for a project (optionally filtered by Feature) with CRUD operations.
 * Shows Tasks count and progress for each User Story.
 */

const UserStoryList = () => {
  const { id: projectId, featureId } = useParams();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [feature, setFeature] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchUserStories();
      if (featureId) {
        fetchFeature();
      }
    }
  }, [projectId, featureId]);

  const fetchFeature = async () => {
    try {
      const { data } = await supabase
        .from('work_items')
        .select('id, title')
        .eq('id', featureId)
        .single();
      setFeature(data);
    } catch (err) {
      console.error('Error fetching feature:', err);
    }
  };

  const fetchUserStories = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'UserStory');

      if (featureId) {
        query = query.eq('parent_id', featureId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Also fetch child Tasks count
      const storiesWithTasks = await Promise.all(
        (data || []).map(async (story) => {
          const { count } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .eq('parent_id', story.id)
            .eq('type', 'Task');

          return {
            ...story,
            tasks_count: count || 0,
          };
        })
      );

      setUserStories(storiesWithTasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user stories:', err);
      setError('Failed to load user stories');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setIsFormOpen(true);
  };

  const handleDelete = async (story) => {
    if (!window.confirm(`Are you sure you want to delete "${story.title}"? This will also delete all associated Tasks.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('work_items')
        .delete()
        .eq('id', story.id);

      if (error) throw error;
      fetchUserStories();
    } catch (err) {
      console.error('Error deleting user story:', err);
      alert('Failed to delete user story. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    fetchUserStories();
    setIsFormOpen(false);
    setEditingStory(null);
  };

  // Filter user stories
  const filteredStories = userStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      'Low': 'bg-gray-100 text-gray-800 border-gray-200',
      'Medium': 'bg-blue-100 text-blue-800 border-blue-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Critical': 'bg-red-100 text-red-800 border-red-200',
    };
    return priorityMap[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchUserStories} className="mt-4">Retry</Button>
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
            {featureId && feature && (
              <div className="flex items-center gap-2 mb-2">
                <Link to={`/projects/${projectId}/features/${featureId}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Feature
                  </Button>
                </Link>
                <span className="text-gray-500">Feature: {feature.title}</span>
              </div>
            )}
            <h1 className="text-2xl font-semibold text-gray-900">User Stories</h1>
            <p className="text-gray-600 text-sm mt-1">
              {featureId ? 'Manage user stories for this feature' : 'Manage project user stories and their tasks'}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add User Story
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search user stories..."
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
          <option value="Backlog">Backlog</option>
          <option value="ToDo">To Do</option>
          <option value="InProgress">In Progress</option>
          <option value="InReview">In Review</option>
          <option value="Done">Done</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* User Stories Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Story Points</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {userStories.length === 0 
                    ? 'No user stories found. Click "Add User Story" to create one.'
                    : 'No user stories match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredStories.map((story) => (
                <TableRow key={story.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/user-stories/${story.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {story.title}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {story.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{story.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(story.status)}`}>
                      {story.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityBadgeClass(story.priority)}`}>
                      {story.priority}
                    </span>
                  </TableCell>
                  <TableCell>{story.assignee_name || 'Unassigned'}</TableCell>
                  <TableCell>{story.tasks_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${story.completion_percent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {story.completion_percent || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {story.total_effort ? `${story.completed_effort || 0} / ${story.total_effort}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(story)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(story)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <WorkItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStory(null);
        }}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        workItemType="UserStory"
        editingItem={editingStory}
        parentId={featureId}
      />
    </div>
  );
};

export default UserStoryList;

