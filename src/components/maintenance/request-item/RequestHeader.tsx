
import React from 'react';
import { MaintenanceStatusBadge } from '../MaintenanceStatusBadge';
import { formatDistanceToNow } from 'date-fns';

type RequestHeaderProps = {
  title: string;
  propertyName: string;
  createdAt: string;
  status: string;
};

export function RequestHeader({ title, propertyName, createdAt, status }: RequestHeaderProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    includeSeconds: true
  });

  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">
          {propertyName || "Unknown Property"} • {timeAgo}
        </p>
      </div>
      <MaintenanceStatusBadge status={status} />
    </div>
  );
}
