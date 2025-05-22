
import { useState } from "react";
import { 
  LayoutDashboard, 
  House, 
  Wrench, 
  Users, 
  Menu, 
  Settings,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { UserProfile } from "./UserProfile";
import { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User | null;
  userRole: string | null;
  signOut: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ user, userRole, signOut, sidebarOpen, toggleSidebar }: SidebarProps) {
  const getNavLinks = () => {
    switch (userRole) {
      case "owner":
        return [
          { href: "/owner-dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
          { href: "/owner/properties", label: "Properties", icon: <House className="h-5 w-5" /> },
          { href: "/owner/tenants", label: "Tenants", icon: <Users className="h-5 w-5" /> },
          { href: "/owner/service-providers", label: "Service Providers", icon: <Wrench className="h-5 w-5" /> },
          { href: "/owner/maintenance", label: "Maintenance", icon: <Settings className="h-5 w-5" /> },
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
    <div 
      className={cn(
        "bg-white border-r flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
        sidebarOpen ? "w-64" : "w-0 md:w-20",
        "fixed md:relative h-full z-50 shadow-lg md:shadow-none"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 flex justify-between items-center">
          {sidebarOpen && (
            <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Property Maintenance
            </h1>
          )}
          <button 
            onClick={toggleSidebar} 
            className={cn("p-2 rounded-full hover:bg-white/70", !sidebarOpen && "mx-auto")}
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform text-indigo-700", !sidebarOpen && "rotate-180")} />
          </button>
        </div>
        
        {/* User info */}
        <UserProfile 
          user={user} 
          userRole={userRole} 
          sidebarOpen={sidebarOpen}
        />
        
        {/* Navigation links */}
        <SidebarNav 
          navLinks={navLinks} 
          sidebarOpen={sidebarOpen} 
          signOut={signOut}
        />
      </div>
    </div>
  );
}
