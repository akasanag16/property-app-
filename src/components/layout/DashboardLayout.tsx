
import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* Mobile header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b shadow-sm">
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Property Maintenance</div>
          <NotificationBell />
        </div>

        {/* Sidebar */}
        <Sidebar 
          user={user}
          userRole={userRole}
          signOut={signOut}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main content */}
        <div className="flex-1 transition-all duration-300 bg-gradient-to-b from-gray-50 to-white">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="hidden md:flex justify-end mb-4">
              <NotificationBell />
            </div>
            {children}
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}
