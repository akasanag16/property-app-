
export type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  property: {
    id: string;
    name: string;
  };
  email: string;
  last_payment?: {
    amount: number;
    date: string;
    status: 'paid' | 'pending' | 'overdue';
  };
  next_payment?: {
    amount: number;
    date: string;
    due_in_days: number;
  };
};
