// Sidebar Component - Navigation menu
// This shows the main navigation links for the application

import { 
  LayoutDashboard,  // Dashboard icon
  FolderKanban,     // Projects icon
  Users,            // Resources/Team icon
  CheckSquare,      // Tasks icon
  BarChart3,        // Analytics icon
  Settings          // Settings icon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function Sidebar() {
  // Navigation items data structure
  // Each item has: icon, label, path, and optional badge
  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/', 
      active: true  // Currently active page
    },
    { 
      icon: FolderKanban, 
      label: 'Projects', 
      path: '/projects',
      badge: '12'  // Number of projects
    },
    { 
      icon: Users, 
      label: 'Resources', 
      path: '/resources',
      badge: '8'  // Number of team members
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      path: '/tasks',
      badge: '24'  // Number of tasks
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      path: '/analytics' 
    },
  ]

  return (
    // Sidebar container
    // w-64 = fixed width (16rem = 256px)
    // h-full = full height of parent
    // bg-slate-50 = light gray background
    // border-r = right border
    // flex flex-col = vertical flexbox layout
    <aside className="w-64 h-full bg-slate-50 border-r border-slate-200 flex flex-col">
      
      {/* Navigation Links Section */}
      {/* flex-1 = take up all available space (pushes settings to bottom) */}
      <nav className="flex-1 p-4">
        {/* Section title */}
        <p className="text-xs font-semibold text-slate-500 uppercase mb-4">
          Main Menu
        </p>
        
        {/* Navigation Items List */}
        {/* space-y-1 = vertical spacing between items */}
        <ul className="space-y-1">
          {/* Loop through navItems array and create a menu item for each */}
          {navItems.map((item) => {
            // Destructure properties from item object
            const Icon = item.icon  // Get the icon component
            
            return (
              <li key={item.path}>
                {/* Navigation Button */}
                {/* This would normally be a Link component from a router */}
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${item.active 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  {/* Icon */}
                  <Icon className="w-5 h-5" />
                  
                  {/* Label text */}
                  <span className="flex-1 text-left">{item.label}</span>
                  
                  {/* Badge (if exists) */}
                  {/* Optional chaining: item.badge?.length checks if badge exists and has length */}
                  {item.badge && (
                    <Badge 
                      variant={item.active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings Section (at bottom) */}
      {/* mt-auto = margin-top auto (pushes to bottom) */}
      <div className="p-4 border-t border-slate-200">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
