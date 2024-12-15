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
      agile_practices: {
        Row: {
          action: string
          completed_at: string | null
          day: string
          duration: string | null
          format: string | null
          id: string
          is_completed: boolean | null
          sub_actions: string | null
          team_id: string | null
          type: string
          url: string | null
          who: string
        }
        Insert: {
          action: string
          completed_at?: string | null
          day: string
          duration?: string | null
          format?: string | null
          id?: string
          is_completed?: boolean | null
          sub_actions?: string | null
          team_id?: string | null
          type: string
          url?: string | null
          who: string
        }
        Update: {
          action?: string
          completed_at?: string | null
          day?: string
          duration?: string | null
          format?: string | null
          id?: string
          is_completed?: boolean | null
          sub_actions?: string | null
          team_id?: string | null
          type?: string
          url?: string | null
          who?: string
        }
        Relationships: [
          {
            foreignKeyName: "agile_practices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      default_practices: {
        Row: {
          action: string
          created_at: string | null
          day: string
          duration: string | null
          format: string | null
          id: string
          sub_actions: string | null
          type: string
          who: string
        }
        Insert: {
          action: string
          created_at?: string | null
          day: string
          duration?: string | null
          format?: string | null
          id?: string
          sub_actions?: string | null
          type: string
          who: string
        }
        Update: {
          action?: string
          created_at?: string | null
          day?: string
          duration?: string | null
          format?: string | null
          id?: string
          sub_actions?: string | null
          type?: string
          who?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          capacity_per_day: number | null
          id: string
          name: string
          team_id: string | null
        }
        Insert: {
          capacity_per_day?: number | null
          id?: string
          name: string
          team_id?: string | null
        }
        Update: {
          capacity_per_day?: number | null
          id?: string
          name?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_resources: {
        Row: {
          daily_capacities: Json | null
          resource_id: string
          sprint_id: string
        }
        Insert: {
          daily_capacities?: Json | null
          resource_id: string
          sprint_id: string
        }
        Update: {
          daily_capacities?: Json | null
          resource_id?: string
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_resources_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          commitment_respected: number | null
          created_at: string | null
          duration: number
          end_date: string
          id: string
          is_successful: boolean | null
          objective: string | null
          objective_achieved: boolean | null
          start_date: string
          story_points_committed: number
          story_points_completed: number | null
          team_id: string | null
          theoretical_capacity: number
          velocity_achieved: number | null
        }
        Insert: {
          commitment_respected?: number | null
          created_at?: string | null
          duration: number
          end_date: string
          id?: string
          is_successful?: boolean | null
          objective?: string | null
          objective_achieved?: boolean | null
          start_date: string
          story_points_committed: number
          story_points_completed?: number | null
          team_id?: string | null
          theoretical_capacity: number
          velocity_achieved?: number | null
        }
        Update: {
          commitment_respected?: number | null
          created_at?: string | null
          duration?: number
          end_date?: string
          id?: string
          is_successful?: boolean | null
          objective?: string | null
          objective_achieved?: boolean | null
          start_date?: string
          story_points_committed?: number
          story_points_completed?: number | null
          team_id?: string | null
          theoretical_capacity?: number
          velocity_achieved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
