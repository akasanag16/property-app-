
import { ReactNode } from "react";
import { 
  Home, 
  Building, 
  Users, 
  Wrench, 
  Briefcase,
  DollarSign
} from "lucide-react";
import { UserRole } from "@/lib/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export const useSidebarLinks = (userRole: UserRole | null): NavItem[] => {
  if (!userRole) return [];

  switch (userRole) {
    case "owner":
      return [
        { href: "/owner-dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
        { href: "/owner/properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { href: "/owner/tenants", label: "Tenants", icon: <Users className="h-5 w-5" /> },
        { href: "/owner/service-providers", label: "Service Providers", icon: <Briefcase className="h-5 w-5" /> },
        { href: "/owner/maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        { href: "/owner/rent", label: "Rent Management", icon: <DollarSign className="h-5 w-5" /> }
      ];
    case "tenant":
      return [
        { href: "/tenant-dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
        { href: "/tenant/properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { href: "/tenant/maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> },
        { href: "/tenant/rent", label: "Rent Payments", icon: <DollarSign className="h-5 w-5" /> }
      ];
    case "service_provider":
      return [
        { href: "/service-provider-dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
        { href: "/service-provider/properties", label: "Properties", icon: <Building className="h-5 w-5" /> },
        { href: "/service-provider/maintenance", label: "Maintenance", icon: <Wrench className="h-5 w-5" /> }
      ];
    default:
      return [];
  }
};
