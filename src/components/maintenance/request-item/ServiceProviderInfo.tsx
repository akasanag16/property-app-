
import React from 'react';

type ServiceProviderInfoProps = {
  serviceProvider: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
};

export function ServiceProviderInfo({ serviceProvider }: ServiceProviderInfoProps) {
  if (!serviceProvider) {
    return <p className="mt-3 text-sm italic text-gray-500">No service provider assigned yet</p>;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700">Service Provider:</p>
      <p className="text-sm text-gray-800">
        {serviceProvider.first_name} {serviceProvider.last_name}
      </p>
      {serviceProvider.email && (
        <p className="text-xs text-gray-500">
          <a href={`mailto:${serviceProvider.email}`} className="hover:underline">
            {serviceProvider.email}
          </a>
        </p>
      )}
    </div>
  );
}
