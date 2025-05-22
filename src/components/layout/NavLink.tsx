
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
  const isActive = location.pathname === href;

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
