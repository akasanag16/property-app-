
import React from "react";
import { AlertTriangle } from "lucide-react";

interface DatabaseWarningBannerProps {
  message: string;
  alertType?: "warning" | "error";
  migrationFile?: string;
}

export function DatabaseWarningBanner({ 
  message,
  alertType = "warning",
  migrationFile
}: DatabaseWarningBannerProps) {
  const bgColor = alertType === "warning" 
    ? "bg-amber-50 border-amber-300 text-amber-800"
    : "bg-red-50 border-red-300 text-red-800";

  return (
    <div className={`border ${bgColor} px-4 py-3 rounded-md mb-6 shadow-sm`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">
            {alertType === "warning" ? "Database Update Required:" : "Database Error:"}
          </p>
          <p className="mt-1">
            {message}
          </p>
          <p className="mt-2 text-sm">
            Please run the database migration in the Supabase dashboard to resolve this issue.
            {migrationFile && (
              <span className="font-medium"> Migration file: <code>{migrationFile}</code></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
