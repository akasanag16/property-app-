
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NotFoundProps {
  note?: string;
}

export default function NotFound({ note }: NotFoundProps) {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  // Determine the appropriate dashboard based on user role
  const getDashboardPath = () => {
    if (userRole === "owner") {
      return "/owner-dashboard";
    } else if (userRole === "tenant") {
      return "/tenant-dashboard";
    } else if (userRole === "service_provider") {
      return "/service-provider-dashboard";
    } else {
      return "/";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-gray-400">404</h1>
        <h2 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h2>
        
        {note ? (
          <p className="text-gray-600 mb-8">{note}</p>
        ) : (
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        )}
        
        <div className="space-x-4">
          <Button onClick={() => navigate(getDashboardPath())} className="bg-indigo-600 hover:bg-indigo-700">
            Return to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
