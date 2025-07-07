export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      financial_categories: {
        Row: {
          category_scope: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          transaction_type: string
        }
        Insert: {
          category_scope: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          transaction_type: string
        }
        Update: {
          category_scope?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          transaction_type?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          is_recurring: boolean | null
          nursing_home_id: string | null
          payment_method: string | null
          recurring_frequency: string | null
          reference_number: string | null
          resident_id: string | null
          status: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          nursing_home_id?: string | null
          payment_method?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          resident_id?: string | null
          status?: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          nursing_home_id?: string | null
          payment_method?: string | null
          recurring_frequency?: string | null
          reference_number?: string | null
          resident_id?: string | null
          status?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_nursing_home_id_fkey"
            columns: ["nursing_home_id"]
            isOneToOne: false
            referencedRelation: "nursing_homes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          configuration_id: string | null
          generated_at: string
          id: string
          report_data: Json
          status: string
        }
        Insert: {
          configuration_id?: string | null
          generated_at?: string
          id?: string
          report_data: Json
          status?: string
        }
        Update: {
          configuration_id?: string | null
          generated_at?: string
          id?: string
          report_data?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "report_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_homes: {
        Row: {
          accreditation: string | null
          address: string
          administrator: string
          amenities: string[] | null
          capacity: number
          city: string
          created_at: string
          description: string | null
          email: string
          id: string
          license_number: string
          monthly_rate: number
          name: string
          phone_number: string
          specialties: string[] | null
          state: string
          status: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          accreditation?: string | null
          address: string
          administrator: string
          amenities?: string[] | null
          capacity: number
          city: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          license_number: string
          monthly_rate: number
          name: string
          phone_number: string
          specialties?: string[] | null
          state: string
          status: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          accreditation?: string | null
          address?: string
          administrator?: string
          amenities?: string[] | null
          capacity?: number
          city?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          license_number?: string
          monthly_rate?: number
          name?: string
          phone_number?: string
          specialties?: string[] | null
          state?: string
          status?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_configurations: {
        Row: {
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          filters: Json | null
          id: string
          name: string
          nursing_home_id: string | null
          report_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          filters?: Json | null
          id?: string
          name: string
          nursing_home_id?: string | null
          report_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          filters?: Json | null
          id?: string
          name?: string
          nursing_home_id?: string | null
          report_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_configurations_nursing_home_id_fkey"
            columns: ["nursing_home_id"]
            isOneToOne: false
            referencedRelation: "nursing_homes"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          admission_date: string
          care_level: string
          created_at: string
          date_of_birth: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          first_name: string
          gender: string
          id: string
          income_types: string[] | null
          last_name: string
          mobility_level: string
          notes: string | null
          nursing_home_id: string
          phone_number: string | null
          room_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admission_date: string
          care_level: string
          created_at?: string
          date_of_birth: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          first_name: string
          gender: string
          id?: string
          income_types?: string[] | null
          last_name: string
          mobility_level: string
          notes?: string | null
          nursing_home_id: string
          phone_number?: string | null
          room_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admission_date?: string
          care_level?: string
          created_at?: string
          date_of_birth?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          first_name?: string
          gender?: string
          id?: string
          income_types?: string[] | null
          last_name?: string
          mobility_level?: string
          notes?: string | null
          nursing_home_id?: string
          phone_number?: string | null
          room_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_nursing_home_id_fkey"
            columns: ["nursing_home_id"]
            isOneToOne: false
            referencedRelation: "nursing_homes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
