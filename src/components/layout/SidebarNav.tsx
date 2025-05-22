
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarNavProps {
  navLinks: NavItem[];
  sidebarOpen: boolean;
  signOut: () => void;
}

export function SidebarNav({ navLinks, sidebarOpen, signOut }: SidebarNavProps) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <NavLink 
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              sidebarOpen={sidebarOpen}
            />
          ))}
        </ul>
      </nav>
      
      <div className={cn("p-4 border-t", !sidebarOpen && "flex justify-center")}>
        <Button 
          variant="outline" 
          className={cn(
            "w-full flex items-center justify-center border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700", 
            !sidebarOpen && "w-auto p-2"
          )} 
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {sidebarOpen && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </>
  );
}
