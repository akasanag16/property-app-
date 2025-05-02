
import React from "react";

type PaymentStatus = "paid" | "pending" | "overdue";

interface TenantStatusBadgeProps {
  status: PaymentStatus;
}

export function TenantStatusBadge({ status }: TenantStatusBadgeProps) {
  return (
    <span 
      className={`inline-block px-2 py-1 rounded-full text-xs ${
        status === 'paid' 
          ? 'bg-green-100 text-green-800' 
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
      }`}
    >
      {status === 'paid' 
        ? 'Paid' 
        : status === 'pending'
          ? 'Pending'
          : 'Overdue'
      }
    </span>
  );
}
