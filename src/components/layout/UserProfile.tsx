
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  user: User | null;
  userRole: string | null;
  sidebarOpen: boolean;
}

export function UserProfile({ user, userRole, sidebarOpen }: UserProfileProps) {
  const { first_name, last_name, email, loading } = useUserProfile(user);

  // Get the user's display name or initials
  const getDisplayName = () => {
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (first_name) {
      return first_name;
    } else if (last_name) {
      return last_name;
    } else if (email) {
      // Only use email if no names are available
      return email;
    }
    return "User";
  };

  // Get initials for the avatar
  const getInitials = () => {
    if (first_name && last_name) {
      return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
    } else if (first_name) {
      return first_name.charAt(0).toUpperCase();
    } else if (last_name) {
      return last_name.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className={cn("p-4 border-b bg-indigo-50/50", !sidebarOpen && "flex justify-center")}>
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <AvatarFallback className="text-white font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-gray-800">
              {loading ? (
                <div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
              ) : (
                getDisplayName()
              )}
            </div>
            <div className="text-sm text-indigo-700 capitalize">
              {userRole?.replace("_", " ") || "User"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
