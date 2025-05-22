
import React from 'react';

type TenantInfoProps = {
  tenant: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
};

export function TenantInfo({ tenant }: TenantInfoProps) {
  if (!tenant) {
    return <p className="text-sm italic text-gray-500">No tenant information available</p>;
  }

  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-gray-800">
        {tenant.first_name} {tenant.last_name}
      </p>
      {tenant.email && (
        <p className="text-xs text-gray-500">
          <a href={`mailto:${tenant.email}`} className="hover:underline">
            {tenant.email}
          </a>
        </p>
      )}
    </div>
  );
}
