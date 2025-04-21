
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="text-gray-600">
          You don't have permission to access this page. Your current role is: {userRole || "Unknown"}
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
