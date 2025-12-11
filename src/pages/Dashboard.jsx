// Dashboard Page Component
// This is the main dashboard view that shows overview statistics and recent data

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  Users, 
  ListTodo, 
  TrendingUp,
  Clock,
  AlertCircle 
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function Dashboard() {
  // State management
  const [projects, setProjects] = useState([])
  const [resources, setResources] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch data when component mounts
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch all dashboard data from Supabase
  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Fetch resources
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
      
      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
      
      setProjects(projectsData || [])
      setResources(resourcesData || [])
      setTasks(tasksData || [])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const pendingTasks = tasks.filter(t => t.status === 'todo').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Statistics Cards Row */}
      {/* grid = CSS Grid layout */}
      {/* grid-cols-1 = 1 column on mobile */}
      {/* md:grid-cols-2 = 2 columns on medium screens */}
      {/* lg:grid-cols-4 = 4 columns on large screens */}
      {/* gap-6 = spacing between cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1: Total Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Projects
            </CardTitle>
            <Database className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {projects.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeProjects} active
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 2: Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Team Members
            </CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {resources.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Available resources
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 3: Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Tasks
            </CardTitle>
            <ListTodo className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {tasks.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {completedTasks} completed, {pendingTasks} pending
            </p>
          </CardContent>
        </Card>

        {/* Stat Card 4: Total Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Budget
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">
                      {project.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Progress: {project.progress}%
                    </p>
                  </div>
                  <Badge 
                    variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' :
                      'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
              
              {projects.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No projects yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {/* Status Icon */}
                  {task.status === 'done' ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                  ) : task.status === 'in-progress' ? (
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">
                      {task.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {task.estimated_hours}h estimated
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No tasks yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>Create New Project</Button>
            <Button variant="outline">Add Team Member</Button>
            <Button variant="outline">Create Task</Button>
            <Button variant="outline">View Reports</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
