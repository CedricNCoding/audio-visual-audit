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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cables: {
        Row: {
          cable_recommendation: string | null
          created_at: string
          distance_m: number
          distance_with_margin_m: number | null
          id: string
          point_a: string
          point_b: string
          room_id: string
          signal_type: string
        }
        Insert: {
          cable_recommendation?: string | null
          created_at?: string
          distance_m: number
          distance_with_margin_m?: number | null
          id?: string
          point_a: string
          point_b: string
          room_id: string
          signal_type: string
        }
        Update: {
          cable_recommendation?: string | null
          created_at?: string
          distance_m?: number
          distance_with_margin_m?: number | null
          id?: string
          point_a?: string
          point_b?: string
          room_id?: string
          signal_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cables_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      camera_types: {
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
      connectivity_zones: {
        Row: {
          created_at: string
          displayport_count: number | null
          distance_to_control_room_m: number | null
          hdmi_count: number | null
          id: string
          power_230v_count: number | null
          rj45_count: number | null
          room_id: string
          usba_count: number | null
          usbc_count: number | null
          zone_name: string
        }
        Insert: {
          created_at?: string
          displayport_count?: number | null
          distance_to_control_room_m?: number | null
          hdmi_count?: number | null
          id?: string
          power_230v_count?: number | null
          rj45_count?: number | null
          room_id: string
          usba_count?: number | null
          usbc_count?: number | null
          zone_name: string
        }
        Update: {
          created_at?: string
          displayport_count?: number | null
          distance_to_control_room_m?: number | null
          hdmi_count?: number | null
          id?: string
          power_230v_count?: number | null
          rj45_count?: number | null
          room_id?: string
          usba_count?: number | null
          usbc_count?: number | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "connectivity_zones_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      displays: {
        Row: {
          base_ecran_cm: number | null
          bottom_height_cm: number | null
          created_at: string
          display_type: string
          distance_projection_m: number | null
          height_cm: number | null
          id: string
          position: string | null
          room_id: string
          size_inches: number | null
          viewer_distance_m: number | null
          width_cm: number | null
        }
        Insert: {
          base_ecran_cm?: number | null
          bottom_height_cm?: number | null
          created_at?: string
          display_type: string
          distance_projection_m?: number | null
          height_cm?: number | null
          id?: string
          position?: string | null
          room_id: string
          size_inches?: number | null
          viewer_distance_m?: number | null
          width_cm?: number | null
        }
        Update: {
          base_ecran_cm?: number | null
          bottom_height_cm?: number | null
          created_at?: string
          display_type?: string
          distance_projection_m?: number | null
          height_cm?: number | null
          id?: string
          position?: string | null
          room_id?: string
          size_inches?: number | null
          viewer_distance_m?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "displays_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      microphone_types: {
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
      packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          typology: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          typology: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          typology?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string
          comments: string | null
          contact_name: string | null
          created_at: string
          decision_contact: string | null
          decision_date: string | null
          decision_service: string | null
          id: string
          site_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_name: string
          comments?: string | null
          contact_name?: string | null
          created_at?: string
          decision_contact?: string | null
          decision_date?: string | null
          decision_service?: string | null
          id?: string
          site_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_name?: string
          comments?: string | null
          contact_name?: string | null
          created_at?: string
          decision_contact?: string | null
          decision_date?: string | null
          decision_service?: string | null
          id?: string
          site_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_environment: {
        Row: {
          acoustic_comment: string | null
          brightness_level: string | null
          ceiling_material: string | null
          created_at: string
          floor_material: string | null
          has_acoustic_issue: boolean | null
          has_false_ceiling: boolean | null
          has_raised_floor: boolean | null
          height_m: number | null
          id: string
          length_m: number | null
          room_id: string
          updated_at: string
          wall_material: string | null
          width_m: number | null
        }
        Insert: {
          acoustic_comment?: string | null
          brightness_level?: string | null
          ceiling_material?: string | null
          created_at?: string
          floor_material?: string | null
          has_acoustic_issue?: boolean | null
          has_false_ceiling?: boolean | null
          has_raised_floor?: boolean | null
          height_m?: number | null
          id?: string
          length_m?: number | null
          room_id: string
          updated_at?: string
          wall_material?: string | null
          width_m?: number | null
        }
        Update: {
          acoustic_comment?: string | null
          brightness_level?: string | null
          ceiling_material?: string | null
          created_at?: string
          floor_material?: string | null
          has_acoustic_issue?: boolean | null
          has_false_ceiling?: boolean | null
          has_raised_floor?: boolean | null
          height_m?: number | null
          id?: string
          length_m?: number | null
          room_id?: string
          updated_at?: string
          wall_material?: string | null
          width_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "room_environment_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_sonorization: {
        Row: {
          ambiance_necessaire: boolean | null
          ambiance_type: string | null
          created_at: string
          dante_souhaite: boolean | null
          diffusion_homogene: boolean | null
          dsp_necessaire: boolean | null
          id: string
          larsen_risque: boolean | null
          mixage_multiple: boolean | null
          nb_micros_renfort: number | null
          objectif_acoustique: string | null
          puissance_necessaire: boolean | null
          puissance_niveau: string | null
          renforcement_voix: boolean | null
          retour_necessaire: boolean | null
          retour_type: string | null
          room_id: string
          sources_audio_specifiques: string | null
          type_diffusion: string[] | null
          types_micros_renfort: string[] | null
          updated_at: string
        }
        Insert: {
          ambiance_necessaire?: boolean | null
          ambiance_type?: string | null
          created_at?: string
          dante_souhaite?: boolean | null
          diffusion_homogene?: boolean | null
          dsp_necessaire?: boolean | null
          id?: string
          larsen_risque?: boolean | null
          mixage_multiple?: boolean | null
          nb_micros_renfort?: number | null
          objectif_acoustique?: string | null
          puissance_necessaire?: boolean | null
          puissance_niveau?: string | null
          renforcement_voix?: boolean | null
          retour_necessaire?: boolean | null
          retour_type?: string | null
          room_id: string
          sources_audio_specifiques?: string | null
          type_diffusion?: string[] | null
          types_micros_renfort?: string[] | null
          updated_at?: string
        }
        Update: {
          ambiance_necessaire?: boolean | null
          ambiance_type?: string | null
          created_at?: string
          dante_souhaite?: boolean | null
          diffusion_homogene?: boolean | null
          dsp_necessaire?: boolean | null
          id?: string
          larsen_risque?: boolean | null
          mixage_multiple?: boolean | null
          nb_micros_renfort?: number | null
          objectif_acoustique?: string | null
          puissance_necessaire?: boolean | null
          puissance_niveau?: string | null
          renforcement_voix?: boolean | null
          retour_necessaire?: boolean | null
          retour_type?: string | null
          room_id?: string
          sources_audio_specifiques?: string | null
          type_diffusion?: string[] | null
          types_micros_renfort?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      room_usage: {
        Row: {
          automation_acoustic: boolean | null
          automation_booking: boolean | null
          automation_lighting: boolean | null
          created_at: string
          id: string
          main_usage: string | null
          nombre_personnes: number | null
          platform_type: string | null
          reservation_salle: boolean | null
          room_id: string
          updated_at: string
          usage_intensity: string | null
          user_skill_level: string | null
        }
        Insert: {
          automation_acoustic?: boolean | null
          automation_booking?: boolean | null
          automation_lighting?: boolean | null
          created_at?: string
          id?: string
          main_usage?: string | null
          nombre_personnes?: number | null
          platform_type?: string | null
          reservation_salle?: boolean | null
          room_id: string
          updated_at?: string
          usage_intensity?: string | null
          user_skill_level?: string | null
        }
        Update: {
          automation_acoustic?: boolean | null
          automation_booking?: boolean | null
          automation_lighting?: boolean | null
          created_at?: string
          id?: string
          main_usage?: string | null
          nombre_personnes?: number | null
          platform_type?: string | null
          reservation_salle?: boolean | null
          room_id?: string
          updated_at?: string
          usage_intensity?: string | null
          user_skill_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_usage_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_visio: {
        Row: {
          camera_count: number | null
          camera_types: string[] | null
          created_at: string
          id: string
          mic_count: number | null
          mic_types: string[] | null
          need_to_be_heard: boolean | null
          need_to_be_seen: boolean | null
          need_to_hear: boolean | null
          need_to_see: boolean | null
          room_id: string
          streaming_complexity: string | null
          streaming_enabled: boolean | null
          streaming_platform: string | null
          streaming_type: string | null
          updated_at: string
          visio_platform: string | null
          visio_required: boolean | null
        }
        Insert: {
          camera_count?: number | null
          camera_types?: string[] | null
          created_at?: string
          id?: string
          mic_count?: number | null
          mic_types?: string[] | null
          need_to_be_heard?: boolean | null
          need_to_be_seen?: boolean | null
          need_to_hear?: boolean | null
          need_to_see?: boolean | null
          room_id: string
          streaming_complexity?: string | null
          streaming_enabled?: boolean | null
          streaming_platform?: string | null
          streaming_type?: string | null
          updated_at?: string
          visio_platform?: string | null
          visio_required?: boolean | null
        }
        Update: {
          camera_count?: number | null
          camera_types?: string[] | null
          created_at?: string
          id?: string
          mic_count?: number | null
          mic_types?: string[] | null
          need_to_be_heard?: boolean | null
          need_to_be_seen?: boolean | null
          need_to_hear?: boolean | null
          need_to_see?: boolean | null
          room_id?: string
          streaming_complexity?: string | null
          streaming_enabled?: boolean | null
          streaming_platform?: string | null
          streaming_type?: string | null
          updated_at?: string
          visio_platform?: string | null
          visio_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "room_visio_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          name: string
          package_id: string | null
          project_id: string
          typology: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          package_id?: string | null
          project_id: string
          typology?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          package_id?: string | null
          project_id?: string
          typology?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          quantity: number | null
          room_id: string
          source_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number | null
          room_id: string
          source_type: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number | null
          room_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
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
