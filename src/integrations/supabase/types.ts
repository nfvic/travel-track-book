export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          id: string
          message: string
          operator_id: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          operator_id: string
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          operator_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          booking_id: string | null
          event: string
          id: string
          inserted_at: string | null
          order_id: string | null
          payload: Json | null
          reference: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          event: string
          id?: string
          inserted_at?: string | null
          order_id?: string | null
          payload?: Json | null
          reference?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          event?: string
          id?: string
          inserted_at?: string | null
          order_id?: string | null
          payload?: Json | null
          reference?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          bus_id: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          bus_id: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          bus_id?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          created_at: string | null
          id: string
          is_suspended: boolean
          location_lat: number | null
          location_lng: number | null
          name: string
          owner_id: string
          plate_number: string
          total_seats: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          location_lat?: number | null
          location_lng?: number | null
          name: string
          owner_id: string
          plate_number: string
          total_seats?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_suspended?: boolean
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          owner_id?: string
          plate_number?: string
          total_seats?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          booking_id: string | null
          bus_id: string | null
          created_at: string
          currency: string
          id: string
          route_id: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          bus_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          route_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          bus_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          route_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string
          id: string
          is_suspended: boolean
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          full_name: string
          id: string
          is_suspended?: boolean
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          full_name?: string
          id?: string
          is_suspended?: boolean
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          operator_id: string
          price_cents: number
          stage_coords: Json[] | null
          stages: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          operator_id: string
          price_cents?: number
          stage_coords?: Json[] | null
          stages: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          operator_id?: string
          price_cents?: number
          stage_coords?: Json[] | null
          stages?: string[]
        }
        Relationships: []
      }
      trips: {
        Row: {
          bus_id: string
          completed_at: string | null
          current_stage: string | null
          delay_reason: string | null
          driver_name: string | null
          gps_path: Json | null
          id: string
          is_active: boolean | null
          location_lat: number | null
          location_lng: number | null
          route_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          bus_id: string
          completed_at?: string | null
          current_stage?: string | null
          delay_reason?: string | null
          driver_name?: string | null
          gps_path?: Json | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          route_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          bus_id?: string
          completed_at?: string | null
          current_stage?: string | null
          delay_reason?: string | null
          driver_name?: string | null
          gps_path?: Json | null
          id?: string
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          route_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_analytics: {
        Row: {
          currency: string | null
          day: string | null
          total_amount_cents: number | null
          total_booked_trips: number | null
          total_paid_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "passenger"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operator", "passenger"],
    },
  },
} as const
