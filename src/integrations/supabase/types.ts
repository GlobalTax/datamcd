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
            foreignKeyName: "annual_budgets_restaurant_id_fkey"
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
      integration_configs: {
        Row: {
          advisor_id: string
          api_endpoint: string | null
          api_key_encrypted: string | null
          config_name: string
          configuration: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean | null
          last_sync: string | null
          updated_at: string
        }
        Insert: {
          advisor_id: string
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config_name: string
          configuration: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_sync?: string | null
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          config_name?: string
          configuration?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_sync?: string | null
          updated_at?: string
        }
        Relationships: []
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
          maintenance: number | null
          management_labor: number | null
          month: number
          net_sales: number
          notes: string | null
          operating_income: number | null
          other_expenses: number | null
          other_revenue: number | null
          paper_cost: number | null
          rent: number | null
          rent_percentage: number | null
          restaurant_id: string
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
          maintenance?: number | null
          management_labor?: number | null
          month: number
          net_sales?: number
          notes?: string | null
          operating_income?: number | null
          other_expenses?: number | null
          other_revenue?: number | null
          paper_cost?: number | null
          rent?: number | null
          rent_percentage?: number | null
          restaurant_id: string
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
          maintenance?: number | null
          management_labor?: number | null
          month?: number
          net_sales?: number
          notes?: string | null
          operating_income?: number | null
          other_expenses?: number | null
          other_revenue?: number | null
          paper_cost?: number | null
          rent?: number | null
          rent_percentage?: number | null
          restaurant_id?: string
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
      can: {
        Args: { "": unknown[] }
        Returns: string
      }
      casts_are: {
        Args: { "": string[] }
        Returns: string
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
    Enums: {},
  },
} as const
