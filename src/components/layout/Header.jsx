// Header Component - Top navigation bar
// This appears at the top of every page in the application

import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function Header() {
  return (
    // Header container
    // Fixed height, white background, shadow for depth
    // flex = flexbox layout for horizontal alignment
    // items-center = vertically center items
    // justify-between = space items apart (left and right)
    // px-6 = horizontal padding (1.5rem on left and right)
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      
      {/* LEFT SIDE: Logo and Title */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-slate-800">NexusPPM</h1>
          <p className="text-xs text-slate-500">Project Portfolio Management</p>
        </div>
      </div>

      {/* RIGHT SIDE: Search, Notifications, User */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        {/* Hidden on small screens (hidden sm:flex) */}
        {/* sm:flex means "display flex on small screens and up" */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="bg-transparent border-none outline-none text-sm text-slate-600 w-48"
          />
        </div>

        {/* Notifications Button */}
        {/* relative = allows absolute positioning of child elements */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {/* Notification badge - positioned absolutely in top-right corner */}
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User Menu Button */}
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

export default Header
