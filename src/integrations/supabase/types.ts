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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      actividades: {
        Row: {
          contacto_id: string | null
          cotizacion_id: string | null
          created_at: string
          empresa_id: string | null
          estado: string
          fecha: string
          hora: string | null
          id: string
          notas: string | null
          objetivo: string | null
          oportunidad_id: string | null
          owner_id: string | null
          prioridad: string
          resultado: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          contacto_id?: string | null
          cotizacion_id?: string | null
          created_at?: string
          empresa_id?: string | null
          estado?: string
          fecha?: string
          hora?: string | null
          id?: string
          notas?: string | null
          objetivo?: string | null
          oportunidad_id?: string | null
          owner_id?: string | null
          prioridad?: string
          resultado?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          contacto_id?: string | null
          cotizacion_id?: string | null
          created_at?: string
          empresa_id?: string | null
          estado?: string
          fecha?: string
          hora?: string | null
          id?: string
          notas?: string | null
          objetivo?: string | null
          oportunidad_id?: string | null
          owner_id?: string | null
          prioridad?: string
          resultado?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividades_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          apellidos: string | null
          area: string | null
          correo: string | null
          created_at: string
          empresa_id: string
          extension: string | null
          id: string
          linkedin: string | null
          nivel_contacto: string | null
          nombre: string
          notas: string | null
          owner_id: string | null
          puesto: string | null
          telefono: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          apellidos?: string | null
          area?: string | null
          correo?: string | null
          created_at?: string
          empresa_id: string
          extension?: string | null
          id?: string
          linkedin?: string | null
          nivel_contacto?: string | null
          nombre: string
          notas?: string | null
          owner_id?: string | null
          puesto?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          apellidos?: string | null
          area?: string | null
          correo?: string | null
          created_at?: string
          empresa_id?: string
          extension?: string | null
          id?: string
          linkedin?: string | null
          nivel_contacto?: string | null
          nombre?: string
          notas?: string | null
          owner_id?: string | null
          puesto?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contactos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          archivo_pdf: string | null
          contacto_id: string | null
          created_at: string
          descripcion: string | null
          empresa_id: string
          estado: string
          fecha: string
          fecha_proximo_seguimiento: string | null
          fecha_ultimo_seguimiento: string | null
          folio: string
          id: string
          importe: number
          moneda: string
          notas: string | null
          oportunidad_id: string | null
          owner_id: string | null
          tiempo_entrega: string | null
          updated_at: string
          vigencia: string | null
        }
        Insert: {
          archivo_pdf?: string | null
          contacto_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id: string
          estado?: string
          fecha?: string
          fecha_proximo_seguimiento?: string | null
          fecha_ultimo_seguimiento?: string | null
          folio: string
          id?: string
          importe?: number
          moneda?: string
          notas?: string | null
          oportunidad_id?: string | null
          owner_id?: string | null
          tiempo_entrega?: string | null
          updated_at?: string
          vigencia?: string | null
        }
        Update: {
          archivo_pdf?: string | null
          contacto_id?: string | null
          created_at?: string
          descripcion?: string | null
          empresa_id?: string
          estado?: string
          fecha?: string
          fecha_proximo_seguimiento?: string | null
          fecha_ultimo_seguimiento?: string | null
          folio?: string
          id?: string
          importe?: number
          moneda?: string
          notas?: string | null
          oportunidad_id?: string | null
          owner_id?: string | null
          tiempo_entrega?: string | null
          updated_at?: string
          vigencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ciudad: string | null
          created_at: string
          direccion: string | null
          estado: string | null
          estado_comercial: string
          fecha_proxima_accion: string | null
          id: string
          industria: string | null
          latitud: number | null
          longitud: number | null
          nombre: string
          nombre_comercial: string | null
          notas: string | null
          origen: string
          owner_id: string | null
          parque_industrial: string | null
          proxima_accion: string | null
          sitio_web: string | null
          telefono_general: string | null
          ultima_interaccion: string | null
          updated_at: string
        }
        Insert: {
          ciudad?: string | null
          created_at?: string
          direccion?: string | null
          estado?: string | null
          estado_comercial?: string
          fecha_proxima_accion?: string | null
          id?: string
          industria?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre: string
          nombre_comercial?: string | null
          notas?: string | null
          origen?: string
          owner_id?: string | null
          parque_industrial?: string | null
          proxima_accion?: string | null
          sitio_web?: string | null
          telefono_general?: string | null
          ultima_interaccion?: string | null
          updated_at?: string
        }
        Update: {
          ciudad?: string | null
          created_at?: string
          direccion?: string | null
          estado?: string | null
          estado_comercial?: string
          fecha_proxima_accion?: string | null
          id?: string
          industria?: string | null
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          nombre_comercial?: string | null
          notas?: string | null
          origen?: string
          owner_id?: string | null
          parque_industrial?: string | null
          proxima_accion?: string | null
          sitio_web?: string | null
          telefono_general?: string | null
          ultima_interaccion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oportunidades: {
        Row: {
          competencia: string | null
          contacto_id: string | null
          created_at: string
          empresa_id: string
          etapa: string
          fecha_estimada_cierre: string | null
          fecha_proxima_accion: string | null
          id: string
          moneda: string
          necesidad: string | null
          nombre_proyecto: string
          notas: string | null
          owner_id: string | null
          probabilidad: number
          problema_detectado: string | null
          proxima_accion: string | null
          solucion_propuesta: string | null
          ultima_interaccion: string | null
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          competencia?: string | null
          contacto_id?: string | null
          created_at?: string
          empresa_id: string
          etapa?: string
          fecha_estimada_cierre?: string | null
          fecha_proxima_accion?: string | null
          id?: string
          moneda?: string
          necesidad?: string | null
          nombre_proyecto: string
          notas?: string | null
          owner_id?: string | null
          probabilidad?: number
          problema_detectado?: string | null
          proxima_accion?: string | null
          solucion_propuesta?: string | null
          ultima_interaccion?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          competencia?: string | null
          contacto_id?: string | null
          created_at?: string
          empresa_id?: string
          etapa?: string
          fecha_estimada_cierre?: string | null
          fecha_proxima_accion?: string | null
          id?: string
          moneda?: string
          necesidad?: string | null
          nombre_proyecto?: string
          notas?: string | null
          owner_id?: string | null
          probabilidad?: number
          problema_detectado?: string | null
          proxima_accion?: string | null
          solucion_propuesta?: string | null
          ultima_interaccion?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          contacto_id: string | null
          created_at: string
          empresa_id: string
          fecha: string
          fecha_proxima_accion: string | null
          hora: string | null
          id: string
          informacion_obtenida: string | null
          latitud: number | null
          longitud: number | null
          material_entregado: string | null
          notas: string | null
          owner_id: string | null
          proxima_accion: string | null
          resultado: string
          tipo_visita: string
          updated_at: string
        }
        Insert: {
          contacto_id?: string | null
          created_at?: string
          empresa_id: string
          fecha?: string
          fecha_proxima_accion?: string | null
          hora?: string | null
          id?: string
          informacion_obtenida?: string | null
          latitud?: number | null
          longitud?: number | null
          material_entregado?: string | null
          notas?: string | null
          owner_id?: string | null
          proxima_accion?: string | null
          resultado?: string
          tipo_visita?: string
          updated_at?: string
        }
        Update: {
          contacto_id?: string | null
          created_at?: string
          empresa_id?: string
          fecha?: string
          fecha_proxima_accion?: string | null
          hora?: string | null
          id?: string
          informacion_obtenida?: string | null
          latitud?: number | null
          longitud?: number | null
          material_entregado?: string | null
          notas?: string | null
          owner_id?: string | null
          proxima_accion?: string | null
          resultado?: string
          tipo_visita?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
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
