import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, ChevronRight } from 'lucide-react';
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
import WorkItemForm from './WorkItemForm';

/**
 * Task Detail Page
 * 
 * Shows detailed information about a Task including:
 * - Task details
 * - List of child Tasks (if any)
 * - Progress metrics
 */

const TaskDetail = () => {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [childTasks, setChildTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChildTask, setEditingChildTask] = useState(null);

  useEffect(() => {
    if (taskId) {
      fetchTaskData();
    }
  }, [taskId]);

  const fetchTaskData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Task
      const { data: taskData, error: taskError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('id', taskId)
        .eq('type', 'Task')
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Fetch Child Tasks (Tasks can have child Tasks)
      const { data: childTasksData, error: childTasksError } = await supabase
        .from('vw_work_item_progress_rollup')
        .select('*')
        .eq('project_id', projectId)
        .eq('parent_id', taskId)
        .eq('type', 'Task')
        .order('created_at', { ascending: false });

      if (childTasksError) throw childTasksError;
      setChildTasks(childTasksData || []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching task data:', err);
      setError('Failed to load task details');
      setLoading(false);
    }
  };

  const handleAddChildTask = () => {
    setEditingChildTask(null);
    setIsFormOpen(true);
  };

  const handleEditChildTask = (childTask) => {
    setEditingChildTask(childTask);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchTaskData();
    setIsFormOpen(false);
    setEditingChildTask(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700">{error || 'Task not found'}</p>
          <Button onClick={() => navigate(`/projects/${projectId}/tasks`)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
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
              <Link to={`/projects/${projectId}/tasks`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
            </div>
            <p className="text-gray-600 text-sm">Task Details</p>
          </div>
          <Button onClick={handleAddChildTask}>
            <Plus className="w-4 h-4 mr-2" />
            Add Sub-Task
          </Button>
        </div>
      </div>

      {/* Task Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Priority</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{task.priority}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Assignee</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{task.assignee_name || 'Unassigned'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Sprint</label>
            <p className="text-sm font-medium text-gray-900 mt-1">{task.sprint_name || 'No Sprint'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
            <p className="text-sm text-gray-900 mt-1">{task.description || '—'}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Progress</label>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${task.completion_percent || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {task.completion_percent || 0}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Hours</label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {task.completed_effort || 0} / {task.total_effort || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Child Tasks List */}
      {childTasks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sub-Tasks ({childTasks.length})</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childTasks.map((childTask) => (
                <TableRow key={childTask.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/tasks/${childTask.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {childTask.title}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {childTask.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{childTask.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(childTask.status)}`}>
                      {childTask.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {childTask.assignee_name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${childTask.completion_percent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {childTask.completion_percent || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {childTask.total_effort ? `${childTask.completed_effort || 0} / ${childTask.total_effort}` : '—'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleEditChildTask(childTask)}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sub-Task Form Dialog */}
      <WorkItemForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingChildTask(null);
        }}
        onSuccess={handleFormSuccess}
        projectId={projectId}
        workItemType="Task"
        editingItem={editingChildTask}
        parentId={taskId}
      />
    </div>
  );
};

export default TaskDetail;

