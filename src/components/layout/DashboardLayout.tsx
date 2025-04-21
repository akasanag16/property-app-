
import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  House, 
  Wrench, 
  Users, 
  LogOut, 
  ChevronLeft, 
  Menu, 
  BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (userRole) {
      case "owner":
        return [
          { href: "/owner-dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/owner/properties", label: "Properties", icon: <House className="h-5 w-5" /> },
          { href: "/owner/tenants", label: "Tenants", icon: <Users className="h-5 w-5" /> },
          { href: "/owner/service-providers", label: "Service Providers", icon: <Wrench className="h-5 w-5" /> },
          { href: "/owner/maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        ];
      case "tenant":
        return [
          { href: "/tenant-dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/tenant/properties", label: "My Properties", icon: <House className="h-5 w-5" /> },
          { href: "/tenant/maintenance", label: "Maintenance Requests", icon: <Wrench className="h-5 w-5" /> },
        ];
      case "service_provider":
        return [
          { href: "/service-provider-dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/service-provider/properties", label: "Assigned Properties", icon: <House className="h-5 w-5" /> },
          { href: "/service-provider/maintenance", label: "Maintenance Requests", icon: <Wrench className="h-5 w-5" /> },
        ];
      default:
        return [
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b">
        <button onClick={toggleSidebar} className="p-2">
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-lg font-bold">Property Maintenance</div>
        <button className="p-2 relative">
          <BellRing className="h-6 w-6" />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
          sidebarOpen ? "w-64" : "w-0 md:w-20",
          "fixed md:relative h-full z-50 shadow-lg md:shadow-none"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b flex justify-between items-center">
            {sidebarOpen && <h1 className="font-bold text-lg">Property Maintenance</h1>}
            <button 
              onClick={toggleSidebar} 
              className={cn("p-2 rounded-full hover:bg-gray-100", !sidebarOpen && "mx-auto")}
            >
              <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
            </button>
          </div>
          
          {/* User info */}
          <div className={cn("p-4 border-b", !sidebarOpen && "flex justify-center")}>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="mt-2">
                <div className="font-medium truncate">{user?.email}</div>
                <div className="text-sm text-gray-500 capitalize">{userRole?.replace("_", " ") || "User"}</div>
              </div>
            )}
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100",
                      location.pathname === link.href && "bg-gray-100 font-medium",
                      !sidebarOpen && "justify-center px-2"
                    )}
                  >
                    {link.icon}
                    {sidebarOpen && <span className="ml-3">{link.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout button */}
          <div className={cn("p-4 border-t", !sidebarOpen && "flex justify-center")}>
            <Button 
              variant="outline" 
              className={cn("w-full flex items-center justify-center", !sidebarOpen && "w-auto p-2")} 
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 transition-all duration-300">
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
