
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase project URL and anon key
const supabaseUrl = 'https://smooniqpqenxdbkceppn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb29uaXFwcWVueGRia2NlcHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjI0ODUsImV4cCI6MjA2MDgzODQ4NX0.MhwwE_baKbSuSM8yHUxgREWGwOxEHhW05RygLy3xHBw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  },
  global: {
    headers: {
      'x-client-info': 'lovable-app'
    }
  }
});

// Type definitions needed for table access and RPC functions
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TableDefinitions = Database['public']['Tables'];

export interface RpcFunctionsDefinitions {
  get_tenant_properties: {
    Args: { tenant_id: string };
    Returns: string[];
  };
  get_service_provider_properties: {
    Args: { provider_id: string };
    Returns: string[];
  };
  get_tenant_properties_by_id: {
    Args: { tenant_id_param: string };
    Returns: string[];
  };
  get_service_provider_properties_by_id: {
    Args: { provider_id_param: string };
    Returns: string[];
  };
  is_owner_of_property: {
    Args: { property_id: string };
    Returns: boolean;
  };
  is_service_provider_for_property: {
    Args: { property_id: string };
    Returns: boolean;
  };
  is_tenant_for_property: {
    Args: { property_id: string };
    Returns: boolean;
  };
  get_service_provider_maintenance_requests: {
    Args: { provider_id: string };
    Returns: string[];
  };
  create_property: {
    Args: {
      name_param: string;
      address_param: string;
      owner_id_param: string;
      details_param?: Json;
    };
    Returns: string;
  };
  get_property_name: {
    Args: { property_id_param: string };
    Returns: string;
  };
  create_notification: {
    Args: {
      user_id_param: string;
      title_param: string;
      message_param: string;
      type_param: string;
      related_entity_id_param?: string;
      related_entity_type_param?: string;
    };
    Returns: string;
  };
  mark_notification_as_read: {
    Args: { notification_id_param: string };
    Returns: void;
  };
  mark_all_notifications_as_read: {
    Args: { user_id_param: string };
    Returns: void;
  };
  get_user_notifications: {
    Args: { user_id_param: string };
    Returns: TableDefinitions['notifications']['Row'][];
  };
  create_invitation: {
    Args: {
      p_property_id: string;
      p_email: string;
      p_link_token: string;
      p_type: string;
    };
    Returns: string;
  };
  get_property_invitations: {
    Args: { p_property_id: string; p_type: string };
    Returns: Json[];
  };
  update_invitation_expiry: {
    Args: { p_invitation_id: string; p_invitation_type: string };
    Returns: void;
  };
  begin_transaction: {
    Args: Record<string, never>;
    Returns: void;
  };
  commit_transaction: {
    Args: Record<string, never>;
    Returns: void;
  };
  rollback_transaction: {
    Args: Record<string, never>;
    Returns: void;
  };
}
