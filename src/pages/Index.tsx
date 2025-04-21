
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Property Maintenance App</h1>
        <p className="text-xl text-gray-600">Manage your properties efficiently</p>
        <Button onClick={() => navigate("/auth")} size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
