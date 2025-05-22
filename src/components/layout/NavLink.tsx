
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  sidebarOpen: boolean;
}

export function NavLink({ href, label, icon, sidebarOpen }: NavLinkProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse the current URL and the link URL to properly check active state
  const currentPath = location.pathname;
  const currentQuery = new URLSearchParams(location.search);
  
  // Extract base path and query params from href
  const hrefUrl = new URL(href, window.location.origin);
  const hrefPath = hrefUrl.pathname;
  const hrefQuery = new URLSearchParams(hrefUrl.search);
  
  // Check if this link is active, considering query params for dashboard tabs
  const isActive = (() => {
    // Exact path match
    if (currentPath === hrefPath && !hrefUrl.search) {
      return true;
    }
    
    // Dashboard with tab parameter
    if (hrefUrl.search) {
      // For tenant dashboard tabs
      if (hrefPath === "/tenant-dashboard" && currentPath === "/tenant-dashboard") {
        const tabParam = hrefQuery.get('tab');
        const currentTab = currentQuery.get('tab');
        return tabParam === currentTab;
      }
      
      // For service provider dashboard tabs
      if (hrefPath === "/service-provider-dashboard" && currentPath === "/service-provider-dashboard") {
        const tabParam = hrefQuery.get('tab');
        const currentTab = currentQuery.get('tab');
        return tabParam === currentTab;
      }
      
      // Special case for redirects - mark the link as active if we're on the dashboard with the right tab
      if (hrefPath === "/tenant-dashboard" && hrefQuery.get('tab') === "my-properties" && 
          (currentPath === "/tenant/properties")) {
        return true;
      }
      
      if (hrefPath === "/tenant-dashboard" && hrefQuery.get('tab') === "maintenance-requests" && 
          (currentPath === "/tenant/maintenance")) {
        return true;
      }
      
      if (hrefPath === "/tenant-dashboard" && hrefQuery.get('tab') === "rent-payments" && 
          (currentPath === "/tenant/rent")) {
        return true;
      }
      
      // Service provider special cases
      if (hrefPath === "/service-provider-dashboard" && hrefQuery.get('tab') === "assigned-properties" && 
          (currentPath === "/service-provider/properties")) {
        return true;
      }
      
      if (hrefPath === "/service-provider-dashboard" && hrefQuery.get('tab') === "maintenance-requests" && 
          (currentPath === "/service-provider/maintenance")) {
        return true;
      }
    }
    
    return false;
  })();

  return (
    <li>
      <Button
        variant="ghost" 
        className={cn(
          "flex items-center w-full rounded-md px-3 py-2 text-gray-700 hover:bg-indigo-50",
          isActive && "bg-indigo-100 text-indigo-700 font-medium",
          !sidebarOpen && "justify-center px-2"
        )}
        onClick={() => navigate(href)}
      >
        <span className={cn(
          isActive ? "text-indigo-600" : "text-gray-500"
        )}>
          {icon}
        </span>
        {sidebarOpen && <span className="ml-3">{label}</span>}
      </Button>
    </li>
  );
}
