import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, Filter, ChevronRight, Edit, Trash2 } from 'lucide-react';
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
 * Epic List Page
 * 
 * Displays all Epics for a project with CRUD operations.
 * Shows Features count and progress for each Epic.
 */

const EpicList = () => {
  const { id: projectId } = useParams();
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchEpics();
    }
  }, [projectId]);

  const fetchEpics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Epics with progress rollup
      const { data, error: fetchError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'Epic')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Also fetch child Features count
      const epicsWithFeatures = await Promise.all(
        (data || []).map(async (epic) => {
          const { count } = await supabase
            .from('work_items')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .eq('parent_id', epic.id)
            .eq('type', 'Feature');

          return {
            ...epic,
            features_count: count || 0,
          };
        })
      );

      setEpics(epicsWithFeatures);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching epics:', err);
      setError('Failed to load epics');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEpic(null);
    setIsFormOpen(true);
  };

  const handleEdit = (epic) => {
    setEditingEpic(epic);
    setIsFormOpen(true);
  };

  const handleDelete = async (epic) => {
    if (!window.confirm(`Are you sure you want to delete "${epic.title}"? This will also delete all associated Features, User Stories, and Tasks.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('work_items')
        .delete()
        .eq('id', epic.id);

      if (error) throw error;
      fetchEpics();
    } catch (err) {
      console.error('Error deleting epic:', err);
      alert('Failed to delete epic. Please try again.');
    }
  };

  const handleFormSuccess = () => {
    fetchEpics();
    setIsFormOpen(false);
    setEditingEpic(null);
  };

  // Filter epics
  const filteredEpics = epics.filter(epic => {
    const matchesSearch = epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (epic.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || epic.status === statusFilter;
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
          <p className="mt-4 text-gray-600">Loading epics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchEpics} className="mt-4">Retry</Button>
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
            <h1 className="text-2xl font-semibold text-gray-900">Epics</h1>
            <p className="text-gray-600 text-sm mt-1">Manage project epics and their features</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Epic
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search epics..."
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

      {/* Epics Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Story Points</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {epics.length === 0 
                    ? 'No epics found. Click "Add Epic" to create one.'
                    : 'No epics match your filters.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEpics.map((epic) => (
                <TableRow key={epic.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/epics/${epic.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {epic.title}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {epic.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{epic.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(epic.status)}`}>
                      {epic.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityBadgeClass(epic.priority)}`}>
                      {epic.priority}
                    </span>
                  </TableCell>
                  <TableCell>{epic.features_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${epic.completion_percent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {epic.completion_percent || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {epic.total_effort ? `${epic.completed_effort || 0} / ${epic.total_effort}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(epic)}
                        className="p-1.5 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(epic)}
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
          setEditingEpic(null);
        }}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        workItemType="Epic"
        editingItem={editingEpic}
      />
    </div>
  );
};

export default EpicList;

