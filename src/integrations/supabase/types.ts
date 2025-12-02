export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      maintenance_requests: {
        Row: {
          assigned_service_provider_id: string | null
          created_at: string | null
          description: string
          id: string
          property_id: string
          proposed_timeslot: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_service_provider_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          property_id: string
          proposed_timeslot?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_service_provider_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          property_id?: string
          proposed_timeslot?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_service_provider_id_fkey"
            columns: ["assigned_service_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string | null
          details: Json | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          details?: Json | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          property_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_services: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_services_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_reminder_instances: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          owner_notified: boolean
          paid_date: string | null
          property_id: string
          reminder_id: string
          status: Database["public"]["Enums"]["rent_status"]
          tenant_id: string
          tenant_notified: boolean
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          owner_notified?: boolean
          paid_date?: string | null
          property_id: string
          reminder_id: string
          status?: Database["public"]["Enums"]["rent_status"]
          tenant_id: string
          tenant_notified?: boolean
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          owner_notified?: boolean
          paid_date?: string | null
          property_id?: string
          reminder_id?: string
          status?: Database["public"]["Enums"]["rent_status"]
          tenant_id?: string
          tenant_notified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rent_reminder_instances_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_reminder_instances_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "rent_reminders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_reminder_instances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_reminders: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          owner_notification_days: number
          property_id: string
          reminder_day: number
          tenant_notification_days: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          owner_notification_days?: number
          property_id: string
          reminder_day: number
          tenant_notification_days?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_notification_days?: number
          property_id?: string
          reminder_day?: number
          tenant_notification_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_reminders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          link_token: string
          property_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          link_token: string
          property_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          link_token?: string
          property_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_property_link: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          service_provider_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          service_provider_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          service_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_property_link_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_provider_property_link_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          is_used: boolean | null
          link_token: string
          property_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          link_token: string
          property_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          link_token?: string
          property_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_date: string | null
          property_id: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          property_id: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          property_id?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_property_link: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_property_link_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_property_link_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      begin_transaction: { Args: never; Returns: undefined }
      check_and_send_rent_notifications: { Args: never; Returns: number }
      check_owner_property_access: {
        Args: { owner_id_param: string; property_id_param: string }
        Returns: boolean
      }
      check_tenant_property_access: {
        Args: { property_id_param: string; tenant_id_param: string }
        Returns: boolean
      }
      commit_transaction: { Args: never; Returns: undefined }
      create_invitation: {
        Args: {
          p_email: string
          p_link_token: string
          p_property_id: string
          p_type: string
        }
        Returns: string
      }
      create_maintenance_request: {
        Args: {
          description_param: string
          property_id_param: string
          status_param?: string
          tenant_id_param: string
          title_param: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          message_param: string
          related_entity_id_param?: string
          related_entity_type_param?: string
          title_param: string
          type_param: string
          user_id_param: string
        }
        Returns: string
      }
      create_or_update_rent_reminder: {
        Args: {
          amount_param: number
          owner_notification_days_param?: number
          property_id_param: string
          reminder_day_param: number
          tenant_notification_days_param?: number
        }
        Returns: string
      }
      create_property: {
        Args: {
          address_param: string
          details_param?: Json
          name_param: string
          owner_id_param: string
        }
        Returns: string
      }
      generate_all_rent_reminder_instances: { Args: never; Returns: number }
      generate_rent_reminder_instances: {
        Args: { reminder_id_param: string }
        Returns: undefined
      }
      generate_secure_token: { Args: never; Returns: string }
      get_owner_invitations: {
        Args: { invitation_type: string; owner_id_param: string }
        Returns: {
          created_at: string
          email: string
          expires_at: string
          id: string
          link_token: string
          property_id: string
          property_name: string
          status: string
        }[]
      }
      get_owner_properties: {
        Args: { owner_id_param: string }
        Returns: string[]
      }
      get_owner_rent_reminder_instances: {
        Args: { owner_id_param: string }
        Returns: {
          amount: number
          due_date: string
          id: string
          paid_date: string
          property_id: string
          property_name: string
          reminder_id: string
          status: string
          tenant_first_name: string
          tenant_id: string
          tenant_last_name: string
        }[]
      }
      get_owner_rent_reminders: {
        Args: { owner_id_param: string }
        Returns: {
          amount: number
          id: string
          owner_notification_days: number
          property_id: string
          property_name: string
          reminder_day: number
          tenant_notification_days: number
        }[]
      }
      get_owner_service_providers_with_details: {
        Args: { owner_id_param: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          property_id: string
          property_name: string
        }[]
      }
      get_owner_tenants_with_details: {
        Args: { owner_id_param: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          last_payment_date: string
          next_payment_date: string
          payment_amount: number
          payment_status: string
          property_id: string
          property_name: string
        }[]
      }
      get_property_invitations: {
        Args: { p_property_id: string; p_type: string }
        Returns: Json[]
      }
      get_property_name: {
        Args: { property_id_param: string }
        Returns: string
      }
      get_service_provider_maintenance_requests: {
        Args: { provider_id: string }
        Returns: string[]
      }
      get_service_provider_properties: {
        Args: { provider_id: string }
        Returns: string[]
      }
      get_service_provider_properties_by_id: {
        Args: { provider_id_param: string }
        Returns: string[]
      }
      get_tenant_properties: { Args: { tenant_id: string }; Returns: string[] }
      get_tenant_properties_by_id: {
        Args: { tenant_id_param: string }
        Returns: string[]
      }
      get_tenant_rent_reminder_instances: {
        Args: { tenant_id_param: string }
        Returns: {
          amount: number
          due_date: string
          id: string
          paid_date: string
          property_id: string
          property_name: string
          status: string
        }[]
      }
      get_user_notifications: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_owner_of_property: { Args: { property_id: string }; Returns: boolean }
      is_service_provider_for_property: {
        Args: { property_id: string }
        Returns: boolean
      }
      is_tenant_for_property: {
        Args: { property_id: string }
        Returns: boolean
      }
      list_public_tables: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
      mark_all_notifications_as_read: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      mark_notification_as_read: {
        Args: { notification_id_param: string }
        Returns: undefined
      }
      mark_rent_as_paid: {
        Args: { instance_id_param: string }
        Returns: boolean
      }
      mark_rent_as_pending: {
        Args: { instance_id_param: string }
        Returns: boolean
      }
      process_rent_notifications: { Args: never; Returns: number }
      process_rent_reminder_generation: { Args: never; Returns: number }
      rollback_transaction: { Args: never; Returns: undefined }
      safe_check_owner_property_link: {
        Args: { property_id_param: string; user_id_param: string }
        Returns: boolean
      }
      safe_check_tenant_property_access: {
        Args: { property_id_param: string; tenant_id_param: string }
        Returns: boolean
      }
      safe_get_owner_maintenance_requests: {
        Args: { owner_id_param: string }
        Returns: {
          assigned_service_provider_id: string
          created_at: string
          description: string
          id: string
          property_id: string
          property_name: string
          provider_first_name: string
          provider_last_name: string
          status: string
          tenant_first_name: string
          tenant_id: string
          tenant_last_name: string
          title: string
        }[]
      }
      safe_get_owner_properties: {
        Args: { owner_id_param: string }
        Returns: {
          address: string
          details: Json
          id: string
          name: string
          owner_id: string
        }[]
      }
      safe_get_property_by_id_for_service_provider: {
        Args: { property_id_param: string; service_provider_id_param: string }
        Returns: {
          address: string
          details: Json
          id: string
          name: string
        }[]
      }
      safe_get_property_maintenance_requests_for_provider: {
        Args: { property_id_param: string; service_provider_id_param: string }
        Returns: {
          assigned_service_provider_id: string
          created_at: string
          description: string
          id: string
          property_id: string
          property_name: string
          status: string
          tenant_first_name: string
          tenant_id: string
          tenant_last_name: string
          title: string
        }[]
      }
      safe_get_property_service_providers: {
        Args: { property_id_param: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      safe_get_service_provider_maintenance_requests: {
        Args: { provider_id_param: string }
        Returns: {
          assigned_service_provider_id: string
          created_at: string
          description: string
          id: string
          property_id: string
          property_name: string
          status: string
          tenant_first_name: string
          tenant_id: string
          tenant_last_name: string
          title: string
        }[]
      }
      safe_get_service_provider_properties: {
        Args: { provider_id_param: string }
        Returns: {
          address: string
          details: Json
          id: string
          name: string
        }[]
      }
      safe_get_service_provider_property_links: {
        Args: { owner_id_param: string }
        Returns: {
          property_id: string
          property_name: string
          service_provider_id: string
        }[]
      }
      safe_get_tenant_maintenance_requests: {
        Args: { tenant_id_param: string }
        Returns: {
          assigned_service_provider_id: string
          created_at: string
          description: string
          id: string
          property_id: string
          property_name: string
          status: string
          tenant_id: string
          title: string
        }[]
      }
      safe_get_tenant_properties: {
        Args: { tenant_id_param: string }
        Returns: {
          address: string
          details: Json
          id: string
          name: string
        }[]
      }
      safe_get_tenant_property_links: {
        Args: { owner_id_param: string }
        Returns: {
          property_id: string
          property_name: string
          tenant_id: string
        }[]
      }
      safe_is_owner_of_property: {
        Args: { property_id_param: string; user_id_param: string }
        Returns: boolean
      }
      safe_service_provider_update_request: {
        Args: {
          request_id_param: string
          service_provider_id_param: string
          status_param: string
        }
        Returns: boolean
      }
      safe_update_maintenance_request: {
        Args: {
          owner_id_param: string
          request_id_param: string
          service_provider_id_param?: string
          status_param: string
        }
        Returns: boolean
      }
      safe_update_property_details: {
        Args: {
          name_param: string
          owner_id_param: string
          property_id_param: string
        }
        Returns: boolean
      }
      update_invitation_expiry: {
        Args: { p_invitation_id: string; p_invitation_type: string }
        Returns: undefined
      }
      validate_email_format: { Args: { email_input: string }; Returns: boolean }
      validate_role_change: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          old_role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      rent_status: "pending" | "paid" | "overdue"
      request_status: "pending" | "accepted" | "completed"
      user_role: "owner" | "tenant" | "service_provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      rent_status: ["pending", "paid", "overdue"],
      request_status: ["pending", "accepted", "completed"],
      user_role: ["owner", "tenant", "service_provider"],
    },
  },
} as const
