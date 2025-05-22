
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
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Mobile header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b shadow-sm">
          <button onClick={toggleSidebar} className="p-2">
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Property Maintenance</div>
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
        <div className="flex-1 transition-all duration-300 bg-gradient-to-b from-indigo-50/30 to-white">
          <div className="p-4 md:p-6">
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
