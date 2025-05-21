
import { AlertCircle } from "lucide-react";

export function EmptyServiceProviderState() {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-lg border">
      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-gray-700">No Service Providers Assigned</h3>
      <p className="text-gray-500 mt-1">
        You haven't assigned any service providers to your properties yet.
      </p>
    </div>
  );
}
