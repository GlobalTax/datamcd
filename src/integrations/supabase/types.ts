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
      accounting_integration_configs: {
        Row: {
          accounting_system: string
          api_key_encrypted: string | null
          company_id_encrypted: string | null
          created_at: string
          created_by: string | null
          credential_version: number | null
          database_encrypted: string | null
          franchisee_id: string | null
          id: string
          is_enabled: boolean | null
          last_key_rotation: string | null
          password_encrypted: string | null
          server_encrypted: string | null
          sync_options: Json | null
          system_name: string
          updated_at: string
          username_encrypted: string | null
        }
        Insert: {
          accounting_system: string
          api_key_encrypted?: string | null
          company_id_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          database_encrypted?: string | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          password_encrypted?: string | null
          server_encrypted?: string | null
          sync_options?: Json | null
          system_name: string
          updated_at?: string
          username_encrypted?: string | null
        }
        Update: {
          accounting_system?: string
          api_key_encrypted?: string | null
          company_id_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          database_encrypted?: string | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          password_encrypted?: string | null
          server_encrypted?: string | null
          sync_options?: Json | null
          system_name?: string
          updated_at?: string
          username_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_integration_configs_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_alert_instances: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_id: string
          created_at: string
          data: Json | null
          franchisee_id: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          restaurant_id: string | null
          severity: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id: string
          created_at?: string
          data?: Json | null
          franchisee_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          restaurant_id?: string | null
          severity?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string
          created_at?: string
          data?: Json | null
          franchisee_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          restaurant_id?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_alert_instances_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "advisor_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_alerts: {
        Row: {
          advisor_id: string
          alert_type: string
          conditions: Json
          created_at: string
          description: string | null
          franchisee_id: string | null
          id: string
          is_active: boolean | null
          restaurant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          alert_type: string
          conditions: Json
          created_at?: string
          description?: string | null
          franchisee_id?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          alert_type?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          franchisee_id?: string | null
          id?: string
          is_active?: boolean | null
          restaurant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      advisor_communications: {
        Row: {
          advisor_id: string
          content: string
          created_at: string
          franchisee_id: string
          id: string
          is_read: boolean | null
          message_type: string
          priority: string | null
          read_at: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          advisor_id: string
          content: string
          created_at?: string
          franchisee_id: string
          id?: string
          is_read?: boolean | null
          message_type: string
          priority?: string | null
          read_at?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          content?: string
          created_at?: string
          franchisee_id?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          priority?: string | null
          read_at?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      advisor_report_templates: {
        Row: {
          advisor_id: string
          configuration: Json
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          report_type: string
          template_name: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          configuration: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          report_type: string
          template_name: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          configuration?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          report_type?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      advisor_reports: {
        Row: {
          advisor_id: string
          expires_at: string | null
          generated_at: string
          id: string
          parameters: Json | null
          report_data: Json
          report_name: string
          template_id: string | null
        }
        Insert: {
          advisor_id: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          parameters?: Json | null
          report_data: Json
          report_name: string
          template_id?: string | null
        }
        Update: {
          advisor_id?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          parameters?: Json | null
          report_data?: Json
          report_name?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "advisor_report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_tasks: {
        Row: {
          advisor_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          franchisee_id: string
          id: string
          priority: string | null
          restaurant_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          franchisee_id: string
          id?: string
          priority?: string | null
          restaurant_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          franchisee_id?: string
          id?: string
          priority?: string | null
          restaurant_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      annual_budgets: {
        Row: {
          apr: number | null
          aug: number | null
          category: string
          created_at: string
          created_by: string | null
          dec: number | null
          feb: number | null
          id: string
          jan: number | null
          jul: number | null
          jun: number | null
          mar: number | null
          may: number | null
          nov: number | null
          oct: number | null
          restaurant_id: string
          sep: number | null
          subcategory: string | null
          updated_at: string
          year: number
        }
        Insert: {
          apr?: number | null
          aug?: number | null
          category: string
          created_at?: string
          created_by?: string | null
          dec?: number | null
          feb?: number | null
          id?: string
          jan?: number | null
          jul?: number | null
          jun?: number | null
          mar?: number | null
          may?: number | null
          nov?: number | null
          oct?: number | null
          restaurant_id: string
          sep?: number | null
          subcategory?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          apr?: number | null
          aug?: number | null
          category?: string
          created_at?: string
          created_by?: string | null
          dec?: number | null
          feb?: number | null
          id?: string
          jan?: number | null
          jul?: number | null
          jun?: number | null
          mar?: number | null
          may?: number | null
          nov?: number | null
          oct?: number | null
          restaurant_id?: string
          sep?: number | null
          subcategory?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "annual_budgets_new_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "franchisee_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      base_restaurants: {
        Row: {
          address: string
          autonomous_community: string | null
          city: string
          company_tax_id: string | null
          country: string | null
          created_at: string
          created_by: string | null
          franchisee_email: string | null
          franchisee_name: string | null
          id: string
          opening_date: string | null
          postal_code: string | null
          property_type: string | null
          restaurant_name: string
          restaurant_type: string | null
          seating_capacity: number | null
          site_number: string
          square_meters: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address: string
          autonomous_community?: string | null
          city: string
          company_tax_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          franchisee_email?: string | null
          franchisee_name?: string | null
          id?: string
          opening_date?: string | null
          postal_code?: string | null
          property_type?: string | null
          restaurant_name: string
          restaurant_type?: string | null
          seating_capacity?: number | null
          site_number: string
          square_meters?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          autonomous_community?: string | null
          city?: string
          company_tax_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          franchisee_email?: string | null
          franchisee_name?: string | null
          id?: string
          opening_date?: string | null
          postal_code?: string | null
          property_type?: string | null
          restaurant_name?: string
          restaurant_type?: string | null
          seating_capacity?: number | null
          site_number?: string
          square_meters?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          company: string | null
          contact_type: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          contact_type: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          contact_type?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_integration_configs: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          created_by: string | null
          credential_version: number | null
          franchisee_id: string | null
          id: string
          is_enabled: boolean | null
          last_key_rotation: string | null
          merchant_id_encrypted: string | null
          provider_id: string
          provider_name: string
          updated_at: string
          webhook_url_encrypted: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          merchant_id_encrypted?: string | null
          provider_id: string
          provider_name: string
          updated_at?: string
          webhook_url_encrypted?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          merchant_id_encrypted?: string | null
          provider_id?: string
          provider_name?: string
          updated_at?: string
          webhook_url_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_integration_configs_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_payroll: {
        Row: {
          base_pay: number | null
          bonuses: number | null
          commissions: number | null
          created_at: string
          created_by: string | null
          employee_id: string
          gross_pay: number
          id: string
          income_tax: number | null
          net_pay: number
          notes: string | null
          other_deductions: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          payment_date: string | null
          period_end: string
          period_start: string
          regular_hours: number | null
          social_security: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          base_pay?: number | null
          bonuses?: number | null
          commissions?: number | null
          created_at?: string
          created_by?: string | null
          employee_id: string
          gross_pay: number
          id?: string
          income_tax?: number | null
          net_pay: number
          notes?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          payment_date?: string | null
          period_end: string
          period_start: string
          regular_hours?: number | null
          social_security?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          base_pay?: number | null
          bonuses?: number | null
          commissions?: number | null
          created_at?: string
          created_by?: string | null
          employee_id?: string
          gross_pay?: number
          id?: string
          income_tax?: number | null
          net_pay?: number
          notes?: string | null
          other_deductions?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          payment_date?: string | null
          period_end?: string
          period_start?: string
          regular_hours?: number | null
          social_security?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_payroll_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_time_off_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_time_off_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_time_tracking: {
        Row: {
          break_end: string | null
          break_start: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          overtime_hours: number | null
          status: string | null
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          overtime_hours?: number | null
          status?: string | null
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_time_tracking_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          bank_account: string | null
          base_salary: number | null
          contract_end_date: string | null
          contract_start_date: string
          contract_type: string
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string
          first_name: string
          hire_date: string
          hourly_rate: number | null
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          position: string
          restaurant_id: string
          salary_frequency: string | null
          schedule_type: string | null
          sick_days_used: number | null
          social_security_number: string | null
          status: string
          termination_date: string | null
          updated_at: string
          vacation_days_pending: number | null
          vacation_days_per_year: number | null
          vacation_days_used: number | null
          weekly_hours: number | null
        }
        Insert: {
          bank_account?: string | null
          base_salary?: number | null
          contract_end_date?: string | null
          contract_start_date: string
          contract_type: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number: string
          first_name: string
          hire_date: string
          hourly_rate?: number | null
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          position: string
          restaurant_id: string
          salary_frequency?: string | null
          schedule_type?: string | null
          sick_days_used?: number | null
          social_security_number?: string | null
          status?: string
          termination_date?: string | null
          updated_at?: string
          vacation_days_pending?: number | null
          vacation_days_per_year?: number | null
          vacation_days_used?: number | null
          weekly_hours?: number | null
        }
        Update: {
          bank_account?: string | null
          base_salary?: number | null
          contract_end_date?: string | null
          contract_start_date?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string
          first_name?: string
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          position?: string
          restaurant_id?: string
          salary_frequency?: string | null
          schedule_type?: string | null
          sick_days_used?: number | null
          social_security_number?: string | null
          status?: string
          termination_date?: string | null
          updated_at?: string
          vacation_days_pending?: number | null
          vacation_days_per_year?: number | null
          vacation_days_used?: number | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "franchisee_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_access_log: {
        Row: {
          franchisee_id: string
          id: string
          ip_address: string | null
          login_time: string
          logout_time: string | null
          session_duration: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          franchisee_id: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          session_duration?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          franchisee_id?: string
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          session_duration?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_access_log_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_activity_log: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          franchisee_id: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          franchisee_id: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          franchisee_id?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_activity_log_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_biloop_companies: {
        Row: {
          biloop_company_id: string
          company_name: string
          created_at: string
          franchisee_id: string
          id: string
          is_active: boolean
          is_primary: boolean
          updated_at: string
        }
        Insert: {
          biloop_company_id: string
          company_name: string
          created_at?: string
          franchisee_id: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          updated_at?: string
        }
        Update: {
          biloop_company_id?: string
          company_name?: string
          created_at?: string
          franchisee_id?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_biloop_companies_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string
          franchisee_id: string
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string
          franchisee_id: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string
          franchisee_id?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_invitations_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_restaurants: {
        Row: {
          advertising_fee_percentage: number | null
          assigned_at: string
          average_monthly_sales: number | null
          base_restaurant_id: string | null
          franchise_end_date: string | null
          franchise_fee_percentage: number | null
          franchise_start_date: string | null
          franchisee_id: string | null
          id: string
          last_year_revenue: number | null
          lease_end_date: string | null
          lease_start_date: string | null
          monthly_rent: number | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          advertising_fee_percentage?: number | null
          assigned_at?: string
          average_monthly_sales?: number | null
          base_restaurant_id?: string | null
          franchise_end_date?: string | null
          franchise_fee_percentage?: number | null
          franchise_start_date?: string | null
          franchisee_id?: string | null
          id?: string
          last_year_revenue?: number | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          advertising_fee_percentage?: number | null
          assigned_at?: string
          average_monthly_sales?: number | null
          base_restaurant_id?: string | null
          franchise_end_date?: string | null
          franchise_fee_percentage?: number | null
          franchise_start_date?: string | null
          franchisee_id?: string | null
          id?: string
          last_year_revenue?: number | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_restaurants_base_restaurant_id_fkey"
            columns: ["base_restaurant_id"]
            isOneToOne: false
            referencedRelation: "base_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchisee_restaurants_base_restaurant_id_fkey"
            columns: ["base_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchisee_restaurants_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisee_staff: {
        Row: {
          created_at: string
          franchisee_id: string
          id: string
          permissions: Json | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          franchisee_id: string
          id?: string
          permissions?: Json | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          franchisee_id?: string
          id?: string
          permissions?: Json | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchisee_staff_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchisee_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisees: {
        Row: {
          address: string | null
          biloop_company_id: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          franchisee_name: string
          id: string
          postal_code: string | null
          state: string | null
          tax_id: string | null
          total_restaurants: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          biloop_company_id?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          franchisee_name: string
          id?: string
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          total_restaurants?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          biloop_company_id?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          franchisee_name?: string
          id?: string
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          total_restaurants?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchisees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          incident_id: string
          is_internal: boolean
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          incident_id: string
          is_internal?: boolean
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          incident_id?: string
          is_internal?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_comments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "restaurant_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          clasificacion: string | null
          comentarios_cierre: string | null
          created_at: string | null
          description: string | null
          documento_url: string | null
          estimated_resolution: string | null
          fecha_cierre: string | null
          id: string
          importe_carto: number | null
          ingeniero: string | null
          naves: string | null
          nombre: string | null
          participante: string | null
          periodo: string | null
          priority: string
          provider_id: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          restaurant_id: string | null
          source: string | null
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          clasificacion?: string | null
          comentarios_cierre?: string | null
          created_at?: string | null
          description?: string | null
          documento_url?: string | null
          estimated_resolution?: string | null
          fecha_cierre?: string | null
          id?: string
          importe_carto?: number | null
          ingeniero?: string | null
          naves?: string | null
          nombre?: string | null
          participante?: string | null
          periodo?: string | null
          priority: string
          provider_id?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          source?: string | null
          status: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          clasificacion?: string | null
          comentarios_cierre?: string | null
          created_at?: string | null
          description?: string | null
          documento_url?: string | null
          estimated_resolution?: string | null
          fecha_cierre?: string | null
          id?: string
          importe_carto?: number | null
          ingeniero?: string | null
          naves?: string | null
          nombre?: string | null
          participante?: string | null
          periodo?: string | null
          priority?: string
          provider_id?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          source?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "base_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          access_log: Json | null
          advisor_id: string
          api_endpoint: string | null
          api_key_encrypted: string | null
          config_name: string
          configuration: Json
          created_at: string
          credential_version: number | null
          encrypted_credentials: string | null
          franchisee_id: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          last_key_rotation: string | null
          last_sync: string | null
          updated_at: string
        }
        Insert: {
          access_log?: Json | null
          advisor_id: string
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config_name: string
          configuration: Json
          created_at?: string
          credential_version?: number | null
          encrypted_credentials?: string | null
          franchisee_id?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_key_rotation?: string | null
          last_sync?: string | null
          updated_at?: string
        }
        Update: {
          access_log?: Json | null
          advisor_id?: string
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config_name?: string
          configuration?: Json
          created_at?: string
          credential_version?: number | null
          encrypted_credentials?: string | null
          franchisee_id?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_key_rotation?: string | null
          last_sync?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_definitions: {
        Row: {
          calc_sql: string | null
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          label: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          calc_sql?: string | null
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          calc_sql?: string | null
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      metric_snapshots: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_id: string | null
          period_end: string | null
          period_start: string | null
          restaurant_id: string | null
          snapshot_date: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_id?: string | null
          period_end?: string | null
          period_start?: string | null
          restaurant_id?: string | null
          snapshot_date?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_id?: string | null
          period_end?: string | null
          period_start?: string | null
          restaurant_id?: string | null
          snapshot_date?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_snapshots_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metric_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_snapshots_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "base_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_snapshots_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurant"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_tracking: {
        Row: {
          actual_food_cost: number | null
          actual_labor_cost: number | null
          actual_marketing: number | null
          actual_other_expenses: number | null
          actual_rent: number | null
          actual_revenue: number | null
          actual_utilities: number | null
          average_ticket: number | null
          created_at: string
          created_by: string | null
          customer_count: number | null
          franchisee_restaurant_id: string | null
          id: string
          labor_hours: number | null
          month: number
          notes: string | null
          updated_at: string
          year: number
        }
        Insert: {
          actual_food_cost?: number | null
          actual_labor_cost?: number | null
          actual_marketing?: number | null
          actual_other_expenses?: number | null
          actual_rent?: number | null
          actual_revenue?: number | null
          actual_utilities?: number | null
          average_ticket?: number | null
          created_at?: string
          created_by?: string | null
          customer_count?: number | null
          franchisee_restaurant_id?: string | null
          id?: string
          labor_hours?: number | null
          month: number
          notes?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          actual_food_cost?: number | null
          actual_labor_cost?: number | null
          actual_marketing?: number | null
          actual_other_expenses?: number | null
          actual_rent?: number | null
          actual_revenue?: number | null
          actual_utilities?: number | null
          average_ticket?: number | null
          created_at?: string
          created_by?: string | null
          customer_count?: number | null
          franchisee_restaurant_id?: string | null
          id?: string
          labor_hours?: number | null
          month?: number
          notes?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_tracking_franchisee_restaurant_id_fkey"
            columns: ["franchisee_restaurant_id"]
            isOneToOne: false
            referencedRelation: "franchisee_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orquest_employee_mapping: {
        Row: {
          created_at: string | null
          id: string
          local_employee_id: string | null
          orquest_employee_id: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          local_employee_id?: string | null
          orquest_employee_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          local_employee_id?: string | null
          orquest_employee_id?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orquest_employee_mapping_local_employee_id_fkey"
            columns: ["local_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orquest_employee_mapping_orquest_employee_id_fkey"
            columns: ["orquest_employee_id"]
            isOneToOne: false
            referencedRelation: "orquest_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      orquest_employee_metrics: {
        Row: {
          año: number
          created_at: string | null
          franchisee_id: string | null
          id: string
          mes: number
          promedio_asistencia: number | null
          service_id: string | null
          tasa_ausentismo: number | null
          total_ausencias: number | null
          total_empleados: number | null
          total_horas_netas: number | null
          total_horas_nocturnas: number | null
          total_turnos_cierre: number | null
          updated_at: string | null
        }
        Insert: {
          año: number
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          mes: number
          promedio_asistencia?: number | null
          service_id?: string | null
          tasa_ausentismo?: number | null
          total_ausencias?: number | null
          total_empleados?: number | null
          total_horas_netas?: number | null
          total_horas_nocturnas?: number | null
          total_turnos_cierre?: number | null
          updated_at?: string | null
        }
        Update: {
          año?: number
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          mes?: number
          promedio_asistencia?: number | null
          service_id?: string | null
          tasa_ausentismo?: number | null
          total_ausencias?: number | null
          total_empleados?: number | null
          total_horas_netas?: number | null
          total_horas_nocturnas?: number | null
          total_turnos_cierre?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orquest_employee_metrics_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      orquest_employees: {
        Row: {
          año_datos: number | null
          apellidos: string | null
          asistencia_trabajo: number | null
          datos_completos: Json | null
          departamento: string | null
          dia_trabajado: number | null
          dias_ausencia_injustificada: number | null
          dias_ausencia_justificada: number | null
          dias_ausencia_parcial: number | null
          dias_baja_accidente: number | null
          dias_baja_it: number | null
          dias_cedido: number | null
          dias_compensacion_festivos: number | null
          dias_festivo_no_trabajado: number | null
          dias_formacion_externa: number | null
          dias_otra_incidencia: number | null
          dias_sancion: number | null
          dias_vacaciones: number | null
          email: string | null
          estado: string | null
          fecha_alta: string | null
          fecha_baja: string | null
          fecha_inicio_contrato: string | null
          franchisee_id: string | null
          horas_ausencia_injustificada: number | null
          horas_ausencia_justificada: number | null
          horas_ausencia_parcial: number | null
          horas_baja_accidente: number | null
          horas_baja_it: number | null
          horas_compensacion_festivos: number | null
          horas_festivo_no_trabajado: number | null
          horas_formacion_externa: number | null
          horas_netas_mensuales: number | null
          horas_nocturnas_tipo2: number | null
          horas_nocturnas_tipo3: number | null
          horas_sancion: number | null
          horas_vacaciones: number | null
          id: string
          mes_datos: number | null
          nif: string | null
          nombre: string | null
          puesto: string | null
          service_id: string | null
          telefono: string | null
          turnos_cierre: number | null
          updated_at: string | null
        }
        Insert: {
          año_datos?: number | null
          apellidos?: string | null
          asistencia_trabajo?: number | null
          datos_completos?: Json | null
          departamento?: string | null
          dia_trabajado?: number | null
          dias_ausencia_injustificada?: number | null
          dias_ausencia_justificada?: number | null
          dias_ausencia_parcial?: number | null
          dias_baja_accidente?: number | null
          dias_baja_it?: number | null
          dias_cedido?: number | null
          dias_compensacion_festivos?: number | null
          dias_festivo_no_trabajado?: number | null
          dias_formacion_externa?: number | null
          dias_otra_incidencia?: number | null
          dias_sancion?: number | null
          dias_vacaciones?: number | null
          email?: string | null
          estado?: string | null
          fecha_alta?: string | null
          fecha_baja?: string | null
          fecha_inicio_contrato?: string | null
          franchisee_id?: string | null
          horas_ausencia_injustificada?: number | null
          horas_ausencia_justificada?: number | null
          horas_ausencia_parcial?: number | null
          horas_baja_accidente?: number | null
          horas_baja_it?: number | null
          horas_compensacion_festivos?: number | null
          horas_festivo_no_trabajado?: number | null
          horas_formacion_externa?: number | null
          horas_netas_mensuales?: number | null
          horas_nocturnas_tipo2?: number | null
          horas_nocturnas_tipo3?: number | null
          horas_sancion?: number | null
          horas_vacaciones?: number | null
          id: string
          mes_datos?: number | null
          nif?: string | null
          nombre?: string | null
          puesto?: string | null
          service_id?: string | null
          telefono?: string | null
          turnos_cierre?: number | null
          updated_at?: string | null
        }
        Update: {
          año_datos?: number | null
          apellidos?: string | null
          asistencia_trabajo?: number | null
          datos_completos?: Json | null
          departamento?: string | null
          dia_trabajado?: number | null
          dias_ausencia_injustificada?: number | null
          dias_ausencia_justificada?: number | null
          dias_ausencia_parcial?: number | null
          dias_baja_accidente?: number | null
          dias_baja_it?: number | null
          dias_cedido?: number | null
          dias_compensacion_festivos?: number | null
          dias_festivo_no_trabajado?: number | null
          dias_formacion_externa?: number | null
          dias_otra_incidencia?: number | null
          dias_sancion?: number | null
          dias_vacaciones?: number | null
          email?: string | null
          estado?: string | null
          fecha_alta?: string | null
          fecha_baja?: string | null
          fecha_inicio_contrato?: string | null
          franchisee_id?: string | null
          horas_ausencia_injustificada?: number | null
          horas_ausencia_justificada?: number | null
          horas_ausencia_parcial?: number | null
          horas_baja_accidente?: number | null
          horas_baja_it?: number | null
          horas_compensacion_festivos?: number | null
          horas_festivo_no_trabajado?: number | null
          horas_formacion_externa?: number | null
          horas_netas_mensuales?: number | null
          horas_nocturnas_tipo2?: number | null
          horas_nocturnas_tipo3?: number | null
          horas_sancion?: number | null
          horas_vacaciones?: number | null
          id?: string
          mes_datos?: number | null
          nif?: string | null
          nombre?: string | null
          puesto?: string | null
          service_id?: string | null
          telefono?: string | null
          turnos_cierre?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orquest_employees_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      orquest_forecasts_sent: {
        Row: {
          created_at: string
          error_message: string | null
          forecast_data: Json
          forecast_type: string
          franchisee_id: string
          id: string
          orquest_response: Json | null
          period_from: string
          period_to: string
          restaurant_id: string | null
          sent_at: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          forecast_data: Json
          forecast_type: string
          franchisee_id: string
          id?: string
          orquest_response?: Json | null
          period_from: string
          period_to: string
          restaurant_id?: string | null
          sent_at?: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          forecast_data?: Json
          forecast_type?: string
          franchisee_id?: string
          id?: string
          orquest_response?: Json | null
          period_from?: string
          period_to?: string
          restaurant_id?: string | null
          sent_at?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      orquest_measure_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          measure_type: string
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          measure_type: string
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          measure_type?: string
          unit?: string | null
        }
        Relationships: []
      }
      orquest_measures: {
        Row: {
          business_id: string | null
          created_at: string | null
          franchisee_id: string | null
          from_time: string
          id: string
          measure_category: string | null
          measure_type: string
          raw_data: Json | null
          service_id: string | null
          to_time: string
          updated_at: string | null
          value: number
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          franchisee_id?: string | null
          from_time: string
          id?: string
          measure_category?: string | null
          measure_type: string
          raw_data?: Json | null
          service_id?: string | null
          to_time: string
          updated_at?: string | null
          value: number
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          franchisee_id?: string | null
          from_time?: string
          id?: string
          measure_category?: string | null
          measure_type?: string
          raw_data?: Json | null
          service_id?: string | null
          to_time?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "orquest_measures_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orquest_measures_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "servicios_orquest"
            referencedColumns: ["id"]
          },
        ]
      }
      orquest_measures_sent: {
        Row: {
          created_at: string
          error_message: string | null
          franchisee_id: string
          id: string
          measure_type: string
          orquest_response: Json | null
          period_from: string
          period_to: string
          restaurant_id: string | null
          sent_at: string
          service_id: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          franchisee_id: string
          id?: string
          measure_type: string
          orquest_response?: Json | null
          period_from: string
          period_to: string
          restaurant_id?: string | null
          sent_at?: string
          service_id: string
          status?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          error_message?: string | null
          franchisee_id?: string
          id?: string
          measure_type?: string
          orquest_response?: Json | null
          period_from?: string
          period_to?: string
          restaurant_id?: string | null
          sent_at?: string
          service_id?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      pos_integration_configs: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          created_by: string | null
          credential_version: number | null
          endpoint_encrypted: string | null
          franchisee_id: string | null
          id: string
          is_enabled: boolean | null
          last_key_rotation: string | null
          password_encrypted: string | null
          pos_name: string
          pos_system: string
          store_id_encrypted: string | null
          updated_at: string
          username_encrypted: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          endpoint_encrypted?: string | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          password_encrypted?: string | null
          pos_name: string
          pos_system: string
          store_id_encrypted?: string | null
          updated_at?: string
          username_encrypted?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          created_by?: string | null
          credential_version?: number | null
          endpoint_encrypted?: string | null
          franchisee_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_key_rotation?: string | null
          password_encrypted?: string | null
          pos_name?: string
          pos_system?: string
          store_id_encrypted?: string | null
          updated_at?: string
          username_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_integration_configs_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      profit_loss_data: {
        Row: {
          advertising: number | null
          advertising_fee: number | null
          benefits: number | null
          created_at: string
          created_by: string | null
          crew_labor: number | null
          food_cost: number | null
          franchise_fee: number | null
          gross_profit: number | null
          id: string
          insurance: number | null
          last_quantum_sync: string | null
          maintenance: number | null
          management_labor: number | null
          month: number
          net_sales: number
          notes: string | null
          operating_income: number | null
          other_expenses: number | null
          other_revenue: number | null
          paper_cost: number | null
          quantum_sync_id: string | null
          rent: number | null
          rent_percentage: number | null
          restaurant_id: string
          source: string | null
          supplies: number | null
          total_cost_of_sales: number | null
          total_labor: number | null
          total_mcdonalds_fees: number | null
          total_operating_expenses: number | null
          total_revenue: number | null
          updated_at: string
          utilities: number | null
          year: number
        }
        Insert: {
          advertising?: number | null
          advertising_fee?: number | null
          benefits?: number | null
          created_at?: string
          created_by?: string | null
          crew_labor?: number | null
          food_cost?: number | null
          franchise_fee?: number | null
          gross_profit?: number | null
          id?: string
          insurance?: number | null
          last_quantum_sync?: string | null
          maintenance?: number | null
          management_labor?: number | null
          month: number
          net_sales?: number
          notes?: string | null
          operating_income?: number | null
          other_expenses?: number | null
          other_revenue?: number | null
          paper_cost?: number | null
          quantum_sync_id?: string | null
          rent?: number | null
          rent_percentage?: number | null
          restaurant_id: string
          source?: string | null
          supplies?: number | null
          total_cost_of_sales?: number | null
          total_labor?: number | null
          total_mcdonalds_fees?: number | null
          total_operating_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
          utilities?: number | null
          year: number
        }
        Update: {
          advertising?: number | null
          advertising_fee?: number | null
          benefits?: number | null
          created_at?: string
          created_by?: string | null
          crew_labor?: number | null
          food_cost?: number | null
          franchise_fee?: number | null
          gross_profit?: number | null
          id?: string
          insurance?: number | null
          last_quantum_sync?: string | null
          maintenance?: number | null
          management_labor?: number | null
          month?: number
          net_sales?: number
          notes?: string | null
          operating_income?: number | null
          other_expenses?: number | null
          other_revenue?: number | null
          paper_cost?: number | null
          quantum_sync_id?: string | null
          rent?: number | null
          rent_percentage?: number | null
          restaurant_id?: string
          source?: string | null
          supplies?: number | null
          total_cost_of_sales?: number | null
          total_labor?: number | null
          total_mcdonalds_fees?: number | null
          total_operating_expenses?: number | null
          total_revenue?: number | null
          updated_at?: string
          utilities?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_profit_loss_restaurant"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["site_number"]
          },
          {
            foreignKeyName: "profit_loss_data_quantum_sync_id_fkey"
            columns: ["quantum_sync_id"]
            isOneToOne: false
            referencedRelation: "quantum_sync_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profit_loss_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
        }
        Relationships: []
      }
      providers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          provider_type: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          provider_type?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          provider_type?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quantum_account_mapping: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          mapping_type: string
          profit_loss_category: string
          profit_loss_field: string
          quantum_account_code: string
          quantum_account_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          mapping_type?: string
          profit_loss_category: string
          profit_loss_field: string
          quantum_account_code: string
          quantum_account_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          mapping_type?: string
          profit_loss_category?: string
          profit_loss_field?: string
          quantum_account_code?: string
          quantum_account_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      quantum_accounting_data: {
        Row: {
          account_name: string
          account_type: string
          balance: number
          created_at: string
          franchisee_id: string
          id: string
          last_sync: string
          period_end: string
          period_start: string
          quantum_account_code: string
          raw_data: Json | null
          restaurant_id: string
          source: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type: string
          balance?: number
          created_at?: string
          franchisee_id: string
          id?: string
          last_sync?: string
          period_end: string
          period_start: string
          quantum_account_code: string
          raw_data?: Json | null
          restaurant_id: string
          source?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string
          balance?: number
          created_at?: string
          franchisee_id?: string
          id?: string
          last_sync?: string
          period_end?: string
          period_start?: string
          quantum_account_code?: string
          raw_data?: Json | null
          restaurant_id?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      quantum_sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          franchisee_id: string
          id: string
          records_imported: number
          records_processed: number
          records_skipped: number
          restaurant_id: string | null
          status: string
          sync_completed_at: string | null
          sync_started_at: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          franchisee_id: string
          id?: string
          records_imported?: number
          records_processed?: number
          records_skipped?: number
          restaurant_id?: string | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          franchisee_id?: string
          id?: string
          records_imported?: number
          records_processed?: number
          records_skipped?: number
          restaurant_id?: string | null
          status?: string
          sync_completed_at?: string | null
          sync_started_at?: string
          sync_type?: string
        }
        Relationships: []
      }
      rate_limit_blocks: {
        Row: {
          blocked_until: string
          created_at: string
          endpoint: string
          id: string
          ip: string
          reason: string
        }
        Insert: {
          blocked_until: string
          created_at?: string
          endpoint: string
          id?: string
          ip: string
          reason?: string
        }
        Update: {
          blocked_until?: string
          created_at?: string
          endpoint?: string
          id?: string
          ip?: string
          reason?: string
        }
        Relationships: []
      }
      rate_limit_entries: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip: string
          last_request_at: string
          requests: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip: string
          last_request_at?: string
          requests?: number
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip?: string
          last_request_at?: string
          requests?: number
          window_start?: string
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          block_duration: number
          created_at: string
          endpoint: string
          id: string
          ip: string
          requests_count: number
        }
        Insert: {
          block_duration: number
          created_at?: string
          endpoint: string
          id?: string
          ip: string
          requests_count: number
        }
        Update: {
          block_duration?: number
          created_at?: string
          endpoint?: string
          id?: string
          ip?: string
          requests_count?: number
        }
        Relationships: []
      }
      report_definitions: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          report_type: string
          schedule_cron: string | null
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          report_type: string
          schedule_cron?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          report_type?: string
          schedule_cron?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_snapshots: {
        Row: {
          error_message: string | null
          file_size: number | null
          file_url: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          recipients: Json | null
          report_id: string | null
          status: string | null
        }
        Insert: {
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          recipients?: Json | null
          report_id?: string | null
          status?: string | null
        }
        Update: {
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          recipients?: Json | null
          report_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_snapshots_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_budgets: {
        Row: {
          budgeted_food_cost: number | null
          budgeted_labor_cost: number | null
          budgeted_marketing: number | null
          budgeted_other_expenses: number | null
          budgeted_rent: number | null
          budgeted_revenue: number
          budgeted_utilities: number | null
          created_at: string
          created_by: string | null
          franchisee_restaurant_id: string | null
          id: string
          monthly_profit_target: number | null
          monthly_revenue_target: number | null
          updated_at: string
          year: number
        }
        Insert: {
          budgeted_food_cost?: number | null
          budgeted_labor_cost?: number | null
          budgeted_marketing?: number | null
          budgeted_other_expenses?: number | null
          budgeted_rent?: number | null
          budgeted_revenue: number
          budgeted_utilities?: number | null
          created_at?: string
          created_by?: string | null
          franchisee_restaurant_id?: string | null
          id?: string
          monthly_profit_target?: number | null
          monthly_revenue_target?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          budgeted_food_cost?: number | null
          budgeted_labor_cost?: number | null
          budgeted_marketing?: number | null
          budgeted_other_expenses?: number | null
          budgeted_rent?: number | null
          budgeted_revenue?: number
          budgeted_utilities?: number | null
          created_at?: string
          created_by?: string | null
          franchisee_restaurant_id?: string | null
          id?: string
          monthly_profit_target?: number | null
          monthly_revenue_target?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_budgets_franchisee_restaurant_id_fkey"
            columns: ["franchisee_restaurant_id"]
            isOneToOne: false
            referencedRelation: "franchisee_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_incidents: {
        Row: {
          assigned_to: string | null
          clasificacion: string | null
          comentarios_cierre: string | null
          created_at: string
          description: string | null
          documento_url: string | null
          estimated_resolution: string | null
          fecha_cierre: string | null
          id: string
          importe_carto: number | null
          incident_type: string
          ingeniero: string | null
          naves: string | null
          nombre: string | null
          participante: string | null
          periodo: string | null
          priority: string
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          restaurant_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          clasificacion?: string | null
          comentarios_cierre?: string | null
          created_at?: string
          description?: string | null
          documento_url?: string | null
          estimated_resolution?: string | null
          fecha_cierre?: string | null
          id?: string
          importe_carto?: number | null
          incident_type?: string
          ingeniero?: string | null
          naves?: string | null
          nombre?: string | null
          participante?: string | null
          periodo?: string | null
          priority?: string
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          restaurant_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          clasificacion?: string | null
          comentarios_cierre?: string | null
          created_at?: string
          description?: string | null
          documento_url?: string | null
          estimated_resolution?: string | null
          fecha_cierre?: string | null
          id?: string
          importe_carto?: number | null
          incident_type?: string
          ingeniero?: string | null
          naves?: string | null
          nombre?: string | null
          participante?: string | null
          periodo?: string | null
          priority?: string
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          restaurant_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_valuations: {
        Row: {
          change_date: string | null
          created_at: string
          created_by: string | null
          discount_rate: number
          franchise_end_date: string | null
          growth_rate: number
          id: string
          inflation_rate: number
          projections: Json | null
          remaining_years: number | null
          restaurant_id: string
          restaurant_name: string
          total_present_value: number | null
          updated_at: string
          valuation_date: string
          valuation_name: string
          yearly_data: Json
        }
        Insert: {
          change_date?: string | null
          created_at?: string
          created_by?: string | null
          discount_rate?: number
          franchise_end_date?: string | null
          growth_rate?: number
          id?: string
          inflation_rate?: number
          projections?: Json | null
          remaining_years?: number | null
          restaurant_id: string
          restaurant_name: string
          total_present_value?: number | null
          updated_at?: string
          valuation_date?: string
          valuation_name?: string
          yearly_data?: Json
        }
        Update: {
          change_date?: string | null
          created_at?: string
          created_by?: string | null
          discount_rate?: number
          franchise_end_date?: string | null
          growth_rate?: number
          id?: string
          inflation_rate?: number
          projections?: Json | null
          remaining_years?: number | null
          restaurant_id?: string
          restaurant_name?: string
          total_present_value?: number | null
          updated_at?: string
          valuation_date?: string
          valuation_name?: string
          yearly_data?: Json
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          city: string
          country: string | null
          created_at: string
          franchisee_id: string
          id: string
          opening_date: string | null
          postal_code: string | null
          restaurant_name: string
          restaurant_type: string | null
          seating_capacity: number | null
          site_number: string
          square_meters: number | null
          state: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          country?: string | null
          created_at?: string
          franchisee_id: string
          id?: string
          opening_date?: string | null
          postal_code?: string | null
          restaurant_name: string
          restaurant_type?: string | null
          seating_capacity?: number | null
          site_number: string
          square_meters?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          country?: string | null
          created_at?: string
          franchisee_id?: string
          id?: string
          opening_date?: string | null
          postal_code?: string | null
          restaurant_name?: string
          restaurant_type?: string | null
          seating_capacity?: number | null
          site_number?: string
          square_meters?: number | null
          state?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios_orquest: {
        Row: {
          datos_completos: Json | null
          franchisee_id: string | null
          id: string
          latitud: number | null
          longitud: number | null
          nombre: string | null
          updated_at: string | null
          zona_horaria: string | null
        }
        Insert: {
          datos_completos?: Json | null
          franchisee_id?: string | null
          id: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string | null
          updated_at?: string | null
          zona_horaria?: string | null
        }
        Update: {
          datos_completos?: Json | null
          franchisee_id?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string | null
          updated_at?: string | null
          zona_horaria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicios_orquest_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_orquest_service_mapping: {
        Row: {
          created_at: string | null
          franchisee_id: string | null
          id: string
          service_id: string
        }
        Insert: {
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          service_id: string
        }
        Update: {
          created_at?: string | null
          franchisee_id?: string | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temp_orquest_service_mapping_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "franchisees"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_budgets: {
        Row: {
          budget_name: string
          budget_year: number
          created_at: string
          created_by: string | null
          depreciation: number | null
          discount_rate: number
          final_valuation: number | null
          franchisee_restaurant_id: string | null
          id: string
          inflation_rate: number | null
          initial_sales: number
          interest: number | null
          loan_payment: number | null
          miscellaneous: number | null
          notes: string | null
          pac_percentage: number | null
          projected_cash_flows: Json | null
          rent_index: number | null
          rent_percentage: number | null
          sales_growth_rate: number | null
          service_fees_percentage: number | null
          status: string | null
          updated_at: string
          years_projection: number | null
        }
        Insert: {
          budget_name: string
          budget_year: number
          created_at?: string
          created_by?: string | null
          depreciation?: number | null
          discount_rate: number
          final_valuation?: number | null
          franchisee_restaurant_id?: string | null
          id?: string
          inflation_rate?: number | null
          initial_sales: number
          interest?: number | null
          loan_payment?: number | null
          miscellaneous?: number | null
          notes?: string | null
          pac_percentage?: number | null
          projected_cash_flows?: Json | null
          rent_index?: number | null
          rent_percentage?: number | null
          sales_growth_rate?: number | null
          service_fees_percentage?: number | null
          status?: string | null
          updated_at?: string
          years_projection?: number | null
        }
        Update: {
          budget_name?: string
          budget_year?: number
          created_at?: string
          created_by?: string | null
          depreciation?: number | null
          discount_rate?: number
          final_valuation?: number | null
          franchisee_restaurant_id?: string | null
          id?: string
          inflation_rate?: number | null
          initial_sales?: number
          interest?: number | null
          loan_payment?: number | null
          miscellaneous?: number | null
          notes?: string | null
          pac_percentage?: number | null
          projected_cash_flows?: Json | null
          rent_index?: number | null
          rent_percentage?: number | null
          sales_growth_rate?: number | null
          service_fees_percentage?: number | null
          status?: string | null
          updated_at?: string
          years_projection?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "valuation_budgets_franchisee_restaurant_id_fkey"
            columns: ["franchisee_restaurant_id"]
            isOneToOne: false
            referencedRelation: "franchisee_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      valuation_scenarios: {
        Row: {
          created_at: string
          discount_rate_modifier: number | null
          growth_rate_modifier: number | null
          id: string
          inflation_rate_modifier: number | null
          projections: Json | null
          scenario_description: string | null
          scenario_name: string
          total_present_value: number | null
          updated_at: string
          valuation_id: string
          variance_from_base: number | null
          variance_percentage: number | null
          yearly_modifications: Json | null
        }
        Insert: {
          created_at?: string
          discount_rate_modifier?: number | null
          growth_rate_modifier?: number | null
          id?: string
          inflation_rate_modifier?: number | null
          projections?: Json | null
          scenario_description?: string | null
          scenario_name: string
          total_present_value?: number | null
          updated_at?: string
          valuation_id: string
          variance_from_base?: number | null
          variance_percentage?: number | null
          yearly_modifications?: Json | null
        }
        Update: {
          created_at?: string
          discount_rate_modifier?: number | null
          growth_rate_modifier?: number | null
          id?: string
          inflation_rate_modifier?: number | null
          projections?: Json | null
          scenario_description?: string | null
          scenario_name?: string
          total_present_value?: number | null
          updated_at?: string
          valuation_id?: string
          variance_from_base?: number | null
          variance_percentage?: number | null
          yearly_modifications?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "valuation_scenarios_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "restaurant_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_entity_links: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          created_by_ai: boolean | null
          entity_id: string
          entity_type: string
          id: string
          relationship_type: string | null
          voice_note_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          created_by_ai?: boolean | null
          entity_id: string
          entity_type: string
          id?: string
          relationship_type?: string | null
          voice_note_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          created_by_ai?: boolean | null
          entity_id?: string
          entity_type?: string
          id?: string
          relationship_type?: string | null
          voice_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_entity_links_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: false
            referencedRelation: "voice_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_notes: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_size: number | null
          file_url: string
          id: string
          language: string | null
          quality: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          language?: string | null
          quality?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          language?: string | null
          quality?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_transcripts: {
        Row: {
          ai_summary: string | null
          confidence_score: number | null
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          status: string | null
          transcript: string | null
          voice_note_id: string
        }
        Insert: {
          ai_summary?: string | null
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          transcript?: string | null
          voice_note_id: string
        }
        Update: {
          ai_summary?: string | null
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          transcript?: string | null
          voice_note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcripts_voice_note_id_fkey"
            columns: ["voice_note_id"]
            isOneToOne: true
            referencedRelation: "voice_notes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown | null
          fk_schema_name: unknown | null
          fk_table_name: unknown | null
          fk_table_oid: unknown | null
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown | null
          pk_index_name: unknown | null
          pk_schema_name: unknown | null
          pk_table_name: unknown | null
          pk_table_oid: unknown | null
        }
        Relationships: []
      }
      restaurant: {
        Row: {
          address: string | null
          city: string | null
          company_tax_id: string | null
          country: string | null
          created_at: string | null
          franchisee_email: string | null
          franchisee_name: string | null
          id: string | null
          name: string | null
          opening_date: string | null
          postal_code: string | null
          seating_capacity: number | null
          site_number: string | null
          square_meters: number | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_tax_id?: string | null
          country?: string | null
          created_at?: string | null
          franchisee_email?: string | null
          franchisee_name?: string | null
          id?: string | null
          name?: string | null
          opening_date?: string | null
          postal_code?: string | null
          seating_capacity?: number | null
          site_number?: string | null
          square_meters?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_tax_id?: string | null
          country?: string | null
          created_at?: string | null
          franchisee_email?: string | null
          franchisee_name?: string | null
          id?: string | null
          name?: string | null
          opening_date?: string | null
          postal_code?: string | null
          seating_capacity?: number | null
          site_number?: string | null
          square_meters?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown | null
          langoid: unknown | null
          name: unknown | null
          oid: unknown | null
          owner: unknown | null
          returns: string | null
          returns_set: boolean | null
          schema: unknown | null
          volatility: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _cleanup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _contract_on: {
        Args: { "": string }
        Returns: unknown
      }
      _currtest: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      _db_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _definer: {
        Args: { "": unknown }
        Returns: boolean
      }
      _dexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _expand_context: {
        Args: { "": string }
        Returns: string
      }
      _expand_on: {
        Args: { "": string }
        Returns: string
      }
      _expand_vol: {
        Args: { "": string }
        Returns: string
      }
      _ext_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _extensions: {
        Args: Record<PropertyKey, never> | { "": unknown }
        Returns: unknown[]
      }
      _funkargs: {
        Args: { "": unknown[] }
        Returns: string
      }
      _get: {
        Args: { "": string }
        Returns: number
      }
      _get_db_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_dtype: {
        Args: { "": unknown }
        Returns: string
      }
      _get_language_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_latest: {
        Args: { "": string }
        Returns: number[]
      }
      _get_note: {
        Args: { "": number } | { "": string }
        Returns: string
      }
      _get_opclass_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_rel_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_schema_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_tablespace_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _get_type_owner: {
        Args: { "": unknown }
        Returns: unknown
      }
      _got_func: {
        Args: { "": unknown }
        Returns: boolean
      }
      _grolist: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _has_group: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_role: {
        Args: { "": unknown }
        Returns: boolean
      }
      _has_user: {
        Args: { "": unknown }
        Returns: boolean
      }
      _inherited: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_schema: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_super: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_trusted: {
        Args: { "": unknown }
        Returns: boolean
      }
      _is_verbose: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      _lang: {
        Args: { "": unknown }
        Returns: unknown
      }
      _opc_exists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _parts: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      _pg_sv_type_array: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      _prokind: {
        Args: { p_oid: unknown }
        Returns: unknown
      }
      _query: {
        Args: { "": string }
        Returns: string
      }
      _refine_vol: {
        Args: { "": string }
        Returns: string
      }
      _relexists: {
        Args: { "": unknown }
        Returns: boolean
      }
      _returns: {
        Args: { "": unknown }
        Returns: string
      }
      _strict: {
        Args: { "": unknown }
        Returns: boolean
      }
      _table_privs: {
        Args: Record<PropertyKey, never>
        Returns: unknown[]
      }
      _temptypes: {
        Args: { "": string }
        Returns: string
      }
      _todo: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _vol: {
        Args: { "": unknown }
        Returns: string
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      can: {
        Args: { "": unknown[] }
        Returns: string
      }
      casts_are: {
        Args: { "": string[] }
        Returns: string
      }
      check_session_security: {
        Args:
          | Record<PropertyKey, never>
          | { max_idle_minutes?: number; max_session_minutes?: number }
        Returns: boolean
      }
      cleanup_local_storage_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      cleanup_rate_limit_records: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_test_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      col_is_null: {
        Args:
          | {
              schema_name: unknown
              table_name: unknown
              column_name: unknown
              description?: string
            }
          | { table_name: unknown; column_name: unknown; description?: string }
        Returns: string
      }
      col_not_null: {
        Args:
          | {
              schema_name: unknown
              table_name: unknown
              column_name: unknown
              description?: string
            }
          | { table_name: unknown; column_name: unknown; description?: string }
        Returns: string
      }
      collect_tap: {
        Args: Record<PropertyKey, never> | { "": string[] }
        Returns: string
      }
      create_franchisee_profile: {
        Args: { user_id: string; user_email: string; user_full_name: string }
        Returns: undefined
      }
      create_test_user: {
        Args: { test_email: string; test_role: string }
        Returns: string
      }
      diag: {
        Args:
          | Record<PropertyKey, never>
          | Record<PropertyKey, never>
          | { msg: string }
          | { msg: unknown }
        Returns: string
      }
      diag_test_name: {
        Args: { "": string }
        Returns: string
      }
      do_tap: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      domains_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      enums_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      extensions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      fail: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      findfuncs: {
        Args: { "": string }
        Returns: string[]
      }
      finish: {
        Args: { exception_on_failure?: boolean }
        Returns: string[]
      }
      foreign_tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      functions_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_effective_franchisee_for_advisor: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_auth_status: {
        Args: { user_uuid: string }
        Returns: Json
      }
      groups_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      has_check: {
        Args: { "": unknown }
        Returns: string
      }
      has_composite: {
        Args: { "": unknown }
        Returns: string
      }
      has_domain: {
        Args: { "": unknown }
        Returns: string
      }
      has_enum: {
        Args: { "": unknown }
        Returns: string
      }
      has_extension: {
        Args: { "": unknown }
        Returns: string
      }
      has_fk: {
        Args: { "": unknown }
        Returns: string
      }
      has_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_function: {
        Args: { "": unknown }
        Returns: string
      }
      has_group: {
        Args: { "": unknown }
        Returns: string
      }
      has_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      has_language: {
        Args: { "": unknown }
        Returns: string
      }
      has_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      has_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      has_pk: {
        Args: { "": unknown }
        Returns: string
      }
      has_relation: {
        Args: { "": unknown }
        Returns: string
      }
      has_role: {
        Args: { "": unknown }
        Returns: string
      }
      has_schema: {
        Args: { "": unknown }
        Returns: string
      }
      has_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      has_table: {
        Args: { "": unknown }
        Returns: string
      }
      has_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      has_type: {
        Args: { "": unknown }
        Returns: string
      }
      has_unique: {
        Args: { "": string }
        Returns: string
      }
      has_user: {
        Args: { "": unknown }
        Returns: string
      }
      has_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_composite: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_domain: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_enum: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_extension: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_fk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_foreign_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_function: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_group: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_inherited_tables: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_language: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_materialized_view: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_opclass: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_pk: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_relation: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_role: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_schema: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_sequence: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_table: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_tablespace: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_type: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_user: {
        Args: { "": unknown }
        Returns: string
      }
      hasnt_view: {
        Args: { "": unknown }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      in_todo: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      index_is_primary: {
        Args: { "": unknown }
        Returns: string
      }
      index_is_unique: {
        Args: { "": unknown }
        Returns: string
      }
      is_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      is_clustered: {
        Args: { "": unknown }
        Returns: string
      }
      is_definer: {
        Args: { "": unknown }
        Returns: string
      }
      is_empty: {
        Args: { "": string }
        Returns: string
      }
      is_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      is_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      is_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      is_strict: {
        Args: { "": unknown }
        Returns: string
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      is_window: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_aggregate: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_definer: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_empty: {
        Args: { "": string }
        Returns: string
      }
      isnt_normal_function: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_partitioned: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_procedure: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_strict: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_superuser: {
        Args: { "": unknown }
        Returns: string
      }
      isnt_window: {
        Args: { "": unknown }
        Returns: string
      }
      language_is_trusted: {
        Args: { "": unknown }
        Returns: string
      }
      languages_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      lives_ok: {
        Args: { "": string }
        Returns: string
      }
      log_admin_action: {
        Args: {
          action_type: string
          entity_type: string
          entity_id: string
          details?: Json
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args:
          | {
              event_type: string
              event_description: string
              additional_data?: Json
            }
          | {
              event_type: string
              event_description: string
              user_id_param?: string
              ip_address_param?: unknown
              user_agent_param?: string
              additional_data?: Json
            }
        Returns: undefined
      }
      manually_assign_restaurants_to_existing_franchisees: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      materialized_views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      no_plan: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      num_failed: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ok: {
        Args: { "": boolean }
        Returns: string
      }
      opclasses_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      operators_are: {
        Args: { "": string[] }
        Returns: string
      }
      os_name: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pass: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: string
      }
      pg_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      pg_version_num: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      pgtap_version: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      plan: {
        Args: { "": number }
        Returns: string
      }
      roles_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      run_rls_tests: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      runtests: {
        Args: Record<PropertyKey, never> | { "": string } | { "": unknown }
        Returns: string[]
      }
      schemas_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      sequences_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      skip: {
        Args:
          | { "": number }
          | { "": string }
          | { why: string; how_many: number }
        Returns: string
      }
      tables_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      tablespaces_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      test_admin_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      test_franchisee_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      test_rls_setup: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      test_staff_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      test_superadmin_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      throws_ok: {
        Args: { "": string }
        Returns: string
      }
      todo: {
        Args:
          | { how_many: number }
          | { how_many: number; why: string }
          | { why: string }
          | { why: string; how_many: number }
        Returns: boolean[]
      }
      todo_end: {
        Args: Record<PropertyKey, never>
        Returns: boolean[]
      }
      todo_start: {
        Args: Record<PropertyKey, never> | { "": string }
        Returns: boolean[]
      }
      types_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
      user_has_franchisee_data: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      user_is_staff_of_franchisee: {
        Args: { franchisee_uuid: string }
        Returns: boolean
      }
      users_are: {
        Args: { "": unknown[] }
        Returns: string
      }
      validate_admin_action_enhanced: {
        Args: {
          action_type: string
          target_user_id?: string
          action_data?: Json
        }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password_input: string }
        Returns: Json
      }
      validate_password_strength_secure: {
        Args: { password_input: string }
        Returns: Json
      }
      validate_role_change: {
        Args: { new_role: string; user_id: string }
        Returns: boolean
      }
      validate_session_security: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_user_deletion: {
        Args: { target_user_id: string; deleter_user_id: string }
        Returns: boolean
      }
      validate_user_role_assignment: {
        Args: { target_role: string; assigner_role: string }
        Returns: boolean
      }
      views_are: {
        Args: { "": unknown[] }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
