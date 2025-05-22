
export type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  properties: {
    id: string;
    name: string;
  }[];
  email: string | null;
  last_payment?: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue';
  } | null;
  next_payment?: {
    amount: number;
    date: string;
    due_in_days: number;
  } | null;
};
