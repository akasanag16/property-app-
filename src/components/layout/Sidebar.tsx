
import { useState } from "react";
import { 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { UserProfile } from "./UserProfile";
import { User } from "@supabase/supabase-js";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import { UserRole } from "@/lib/auth";

interface SidebarProps {
  user: User | null;
  userRole: string | null;
  signOut: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ user, userRole, signOut, sidebarOpen, toggleSidebar }: SidebarProps) {
  // Use the sidebar links hook to generate navigation based on user role
  const navLinks = useSidebarLinks(userRole as UserRole);
  
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
