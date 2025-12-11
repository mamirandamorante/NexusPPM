// DashboardLayout Component - Main layout wrapper
// This component wraps your entire application and provides the structure

import Header from './Header'
import Sidebar from './Sidebar'

/**
 * DashboardLayout Component
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Content to display in main area
 * 
 * How to use:
 * <DashboardLayout>
 *   <YourPageContent />
 * </DashboardLayout>
 */
function DashboardLayout({ children }) {
  return (
    // Main container - takes full viewport height and width
    // flex flex-col = vertical flexbox (stack header on top of content)
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      
      {/* Header - fixed at top */}
      <Header />
      
      {/* Content area - contains sidebar and main content */}
      {/* flex-1 = take remaining height after header */}
      {/* flex = horizontal flexbox */}
      {/* overflow-hidden = prevent scrollbar on this level */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar - fixed on left */}
        <Sidebar />
        
        {/* Main Content Area */}
        {/* flex-1 = take remaining width after sidebar */}
        {/* overflow-auto = allow scrolling if content is too tall */}
        {/* p-6 = padding all around (1.5rem) */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {/* This is where your page content goes */}
          {/* "children" is whatever you put between <DashboardLayout> tags */}
          {children}
        </main>
        
      </div>
    </div>
  )
}

export default DashboardLayout
