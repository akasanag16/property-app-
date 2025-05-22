
export type RentStatus = 'pending' | 'paid' | 'overdue';

export interface RentReminder {
  id: string;
  property_id: string;
  property_name: string;
  reminder_day: number;
  amount: number;
  tenant_notification_days: number;
  owner_notification_days: number;
}

export interface RentReminderInstance {
  id: string;
  reminder_id: string;
  property_id: string;
  property_name: string;
  tenant_id: string;
  tenant_first_name: string;
  tenant_last_name: string;
  due_date: string; // ISO date string
  amount: number;
  status: RentStatus;
  paid_date: string | null; // ISO date string
}

export interface CreateRentReminderParams {
  property_id: string;
  reminder_day: number;
  amount: number;
  tenant_notification_days?: number;
  owner_notification_days?: number;
}
