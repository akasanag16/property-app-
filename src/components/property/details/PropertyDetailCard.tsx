
import React from "react";

interface PropertyDetailCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number | null | undefined;
  bgColor?: string;
}

export function PropertyDetailCard({ 
  icon, 
  title, 
  value,
  bgColor = "bg-indigo-100" 
}: PropertyDetailCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border flex items-center">
      <div className={`p-3 ${bgColor} rounded-md mr-4`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="font-medium text-lg">{value || "Not specified"}</div>
      </div>
    </div>
  );
}
