import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on user role
    if (userRole) {
      switch (userRole) {
        case "owner":
          navigate("/owner-dashboard");
          break;
        case "tenant":
          navigate("/tenant-dashboard");
          break;
        case "service_provider":
          navigate("/service-provider-dashboard");
          break;
        default:
          // Keep on the default dashboard if role doesn't match
          break;
      }
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Redirecting based on your role...</p>
      </div>
    </div>
  );
}
