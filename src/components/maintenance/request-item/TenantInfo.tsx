
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
    return null;
  }

  return (
    <div className="mb-3">
      <p className="text-sm font-medium">
        {tenant.first_name} {tenant.last_name}
      </p>
      {tenant.email && (
        <p className="text-xs text-gray-500">{tenant.email}</p>
      )}
    </div>
  );
}
