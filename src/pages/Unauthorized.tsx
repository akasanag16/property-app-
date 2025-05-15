
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Safely try to get the user role from sessionStorage if available
  useEffect(() => {
    try {
      // Check if we can access sessionStorage (might be restricted in some contexts)
      const storedRole = sessionStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(storedRole);
      }
    } catch (error) {
      console.error("Could not access sessionStorage:", error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. 
          {userRole && <span> Your current role is: {userRole}</span>}
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate("/")} variant="default">
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
