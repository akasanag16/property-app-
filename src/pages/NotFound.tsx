
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this might be an invitation link that has the wrong format
  const isLikelyInvitationLink = location.pathname.includes('invitation') || 
                                location.pathname.includes('accept-invitation');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        
        {isLikelyInvitationLink && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-left">
            <p className="text-amber-800 mb-2 font-medium">This might be an invitation link issue</p>
            <p className="text-amber-700 text-sm">
              If you're trying to accept an invitation, please make sure the link is correct
              or contact the person who invited you for a new invitation.
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
