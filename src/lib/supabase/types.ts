// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      active_promotions: {
        Row: {
          bonus_percentage: number
          created_at: string
          destination: string
          id: string
          link: string
          origin: string
          rules_summary: string | null
          title: string
          valid_until: string | null
        }
        Insert: {
          bonus_percentage: number
          created_at?: string
          destination: string
          id?: string
          link: string
          origin: string
          rules_summary?: string | null
          title: string
          valid_until?: string | null
        }
        Update: {
          bonus_percentage?: number
          created_at?: string
          destination?: string
          id?: string
          link?: string
          origin?: string
          rules_summary?: string | null
          title?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      loyalty_balances: {
        Row: {
          balance: number
          id: string
          program_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          program_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          program_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          full_name: string
          id: string
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          full_name: string
          id: string
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          full_name?: string
          id?: string
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_prices: {
        Row: {
          best_price_milheiro: number
          discount_percentage: number | null
          id: string
          program_name: string
          promotion_link: string | null
          updated_at: string
        }
        Insert: {
          best_price_milheiro: number
          discount_percentage?: number | null
          id?: string
          program_name: string
          promotion_link?: string | null
          updated_at?: string
        }
        Update: {
          best_price_milheiro?: number
          discount_percentage?: number | null
          id?: string
          program_name?: string
          promotion_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          bonus_percentage: number | null
          cost: number | null
          created_at: string
          description: string | null
          destination_program: string | null
          id: string
          origin_program: string | null
          points_amount: number
          total_received: number | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          bonus_percentage?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          destination_program?: string | null
          id?: string
          origin_program?: string | null
          points_amount: number
          total_received?: number | null
          transaction_date?: string
          type: string
          user_id: string
        }
        Update: {
          bonus_percentage?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          destination_program?: string | null
          id?: string
          origin_program?: string | null
          points_amount?: number
          total_received?: number | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_goals: {
        Row: {
          current_miles: number
          destination_name: string
          id: string
          image_url: string | null
          is_active: boolean | null
          target_date: string | null
          target_miles: number
          user_id: string
        }
        Insert: {
          current_miles?: number
          destination_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          target_date?: string | null
          target_miles: number
          user_id: string
        }
        Update: {
          current_miles?: number
          destination_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          target_date?: string | null
          target_miles?: number
          user_id?: string
        }
        Relationships: []
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains constraints, RLS policies, functions, triggers,
// indexes and materialized views not present in the type definitions above.

// --- CONSTRAINTS ---
// Table: active_promotions
//   PRIMARY KEY active_promotions_pkey: PRIMARY KEY (id)
// Table: loyalty_balances
//   PRIMARY KEY loyalty_balances_pkey: PRIMARY KEY (id)
//   FOREIGN KEY loyalty_balances_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE loyalty_balances_user_id_program_name_key: UNIQUE (user_id, program_name)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: program_prices
//   PRIMARY KEY program_prices_pkey: PRIMARY KEY (id)
//   UNIQUE program_prices_program_name_key: UNIQUE (program_name)
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   CHECK transactions_type_check: CHECK ((type = ANY (ARRAY['Acúmulo'::text, 'Transferência'::text, 'Compra'::text, 'Resgate'::text])))
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: travel_goals
//   PRIMARY KEY travel_goals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY travel_goals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: active_promotions
//   Policy "Anyone can view active promotions" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Authenticated users can delete active promotions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Authenticated users can insert active promotions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Authenticated users can update active promotions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: loyalty_balances
//   Policy "Users can manage own loyalty balances" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: profiles
//   Policy "Users can update own profile." (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can view own profile." (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: program_prices
//   Policy "Anyone can view program_prices" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: transactions
//   Policy "Users can manage own transactions" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: travel_goals
//   Policy "Users can delete own travel goals." (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can insert own travel goals." (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update own travel goals." (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can view own travel goals." (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, full_name)
//     VALUES (
//       NEW.id,
//       COALESCE(
//         NEW.raw_user_meta_data->>'full_name',
//         NEW.raw_user_meta_data->>'name',
//         'Viajante'
//       )
//     );
//     RETURN NEW;
//   END;
//   $function$
//   

// --- INDEXES ---
// Table: loyalty_balances
//   CREATE UNIQUE INDEX loyalty_balances_user_id_program_name_key ON public.loyalty_balances USING btree (user_id, program_name)
// Table: program_prices
//   CREATE UNIQUE INDEX program_prices_program_name_key ON public.program_prices USING btree (program_name)

