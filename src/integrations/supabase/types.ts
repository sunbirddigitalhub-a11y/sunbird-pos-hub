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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          duration_days: number
          expires_at: string | null
          id: string
          is_used: boolean
          plan: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          is_used?: boolean
          plan?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          is_used?: boolean
          plan?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_by: string | null
          record_id: string | null
          table_name: string
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name: string
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
          user_role?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          business_type: string | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          owner_user_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_type?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          owner_user_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_type?: string | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          owner_user_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number
          business_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          total_spent: number
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          address?: string | null
          balance?: number
          business_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          address?: string | null
          balance?: number
          business_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          total_spent?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          staff_member: string | null
          staff_user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          amount?: number
          business_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          staff_member?: string | null
          staff_user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          staff_member?: string | null
          staff_user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      grandmasters: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          business_id: string | null
          cost_price: number
          created_at: string
          id: string
          imei: string
          product_id: string | null
          quantity: number
          selling_price: number
          status: string
          supplier: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          imei: string
          product_id?: string | null
          quantity?: number
          selling_price?: number
          status?: string
          supplier?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          cost_price?: number
          created_at?: string
          id?: string
          imei?: string
          product_id?: string | null
          quantity?: number
          selling_price?: number
          status?: string
          supplier?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          business_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          payment_method: string
          receipt_url: string | null
          sale_id: string
          staff_name: string | null
          staff_user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          amount?: number
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_url?: string | null
          sale_id: string
          staff_name?: string | null
          staff_user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_url?: string | null
          sale_id?: string
          staff_name?: string | null
          staff_user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          base_price: number
          business_id: string | null
          category: string
          cost_price: number
          created_at: string
          id: string
          image_url: string | null
          in_stock: number
          name: string
          supplier: string | null
          updated_at: string
          variants: string | null
          workspace_id: string | null
        }
        Insert: {
          barcode?: string | null
          base_price?: number
          business_id?: string | null
          category?: string
          cost_price?: number
          created_at?: string
          id?: string
          image_url?: string | null
          in_stock?: number
          name: string
          supplier?: string | null
          updated_at?: string
          variants?: string | null
          workspace_id?: string | null
        }
        Update: {
          barcode?: string | null
          base_price?: number
          business_id?: string | null
          category?: string
          cost_price?: number
          created_at?: string
          id?: string
          image_url?: string | null
          in_stock?: number
          name?: string
          supplier?: string | null
          updated_at?: string
          variants?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          status: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_user_id: string
          reward_type: string | null
          reward_value: number | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          reward_type?: string | null
          reward_value?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_type?: string | null
          reward_value?: number | null
          status?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          imei: string | null
          inventory_id: string | null
          product_name: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          imei?: string | null
          inventory_id?: string | null
          product_name: string
          quantity?: number
          sale_id: string
          total_price?: number
          unit_price?: number
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          imei?: string | null
          inventory_id?: string | null
          product_name?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          business_id: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          notes: string | null
          payment_method: string
          sale_number: string
          sold_by: string | null
          status: string
          total_amount: number
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          sale_number: string
          sold_by?: string | null
          status?: string
          total_amount?: number
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          sale_number?: string
          sold_by?: string | null
          status?: string
          total_amount?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_permissions: {
        Row: {
          allowed: boolean
          business_id: string | null
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed?: boolean
          business_id?: string | null
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed?: boolean
          business_id?: string | null
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_permissions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          is_active: boolean
          is_trial: boolean
          plan: string
          trial_end: string
          trial_start: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_trial?: boolean
          plan?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_trial?: boolean
          plan?: string
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      z_reports: {
        Row: {
          bank_sales: number
          bank_transactions: number
          business_id: string | null
          cash_difference: number | null
          cash_sales: number
          cash_transactions: number
          closed_at: string | null
          closed_by: string | null
          closed_by_name: string | null
          closed_by_role: string | null
          created_at: string
          id: string
          mobile_money_sales: number
          mobile_money_transactions: number
          notes: string | null
          physical_cash: number | null
          report_date: string
          report_snapshot: Json | null
          split_sales: number
          split_transactions: number
          status: string
          total_sales: number
          total_transactions: number
          workspace_id: string | null
        }
        Insert: {
          bank_sales?: number
          bank_transactions?: number
          business_id?: string | null
          cash_difference?: number | null
          cash_sales?: number
          cash_transactions?: number
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closed_by_role?: string | null
          created_at?: string
          id?: string
          mobile_money_sales?: number
          mobile_money_transactions?: number
          notes?: string | null
          physical_cash?: number | null
          report_date: string
          report_snapshot?: Json | null
          split_sales?: number
          split_transactions?: number
          status?: string
          total_sales?: number
          total_transactions?: number
          workspace_id?: string | null
        }
        Update: {
          bank_sales?: number
          bank_transactions?: number
          business_id?: string | null
          cash_difference?: number | null
          cash_sales?: number
          cash_transactions?: number
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closed_by_role?: string | null
          created_at?: string
          id?: string
          mobile_money_sales?: number
          mobile_money_transactions?: number
          notes?: string | null
          physical_cash?: number | null
          report_date?: string
          report_snapshot?: Json | null
          split_sales?: number
          split_transactions?: number
          status?: string
          total_sales?: number
          total_transactions?: number
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "z_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "z_reports_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_business_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_workspace_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_supervisor: { Args: { _user_id: string }; Returns: boolean }
      is_grandmaster: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master_admin" | "supervisor" | "staff"
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
      app_role: ["master_admin", "supervisor", "staff"],
    },
  },
} as const
