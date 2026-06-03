export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string;
type DateString = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          timezone: string | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          timezone?: string | null;
          created_at?: Timestamp | null;
          updated_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: "work" | "personal" | "health" | "spiritual" | "learning" | "admin" | "other" | null;
          priority: "low" | "medium" | "high" | "critical" | null;
          status: "open" | "in_progress" | "completed" | "cancelled" | null;
          due_at: Timestamp | null;
          completed_at: Timestamp | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: "work" | "personal" | "health" | "spiritual" | "learning" | "admin" | "other" | null;
          priority?: "low" | "medium" | "high" | "critical" | null;
          status?: "open" | "in_progress" | "completed" | "cancelled" | null;
          due_at?: Timestamp | null;
          completed_at?: Timestamp | null;
          created_at?: Timestamp | null;
          updated_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: "hydration" | "nutrition" | "training" | "reading" | "prayer" | "meditation" | "sleep" | "focus" | "custom";
          target_frequency: string | null;
          target_value: number | null;
          unit: string | null;
          is_active: boolean | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: "hydration" | "nutrition" | "training" | "reading" | "prayer" | "meditation" | "sleep" | "focus" | "custom";
          target_frequency?: string | null;
          target_value?: number | null;
          unit?: string | null;
          is_active?: boolean | null;
          created_at?: Timestamp | null;
          updated_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string | null;
          user_id: string;
          value: number | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          habit_id?: string | null;
          user_id: string;
          value?: number | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };
      time_blocks: {
        Row: {
          id: string;
          user_id: string;
          category:
            | "work"
            | "deep_work"
            | "admin"
            | "meals"
            | "training"
            | "reading"
            | "prayer_meditation"
            | "social"
            | "scrolling"
            | "rest"
            | "sleep"
            | "commute"
            | "other";
          title: string;
          start_time: Timestamp;
          end_time: Timestamp | null;
          duration_minutes: number | null;
          quality_score: number | null;
          notes: string | null;
          created_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category:
            | "work"
            | "deep_work"
            | "admin"
            | "meals"
            | "training"
            | "reading"
            | "prayer_meditation"
            | "social"
            | "scrolling"
            | "rest"
            | "sleep"
            | "commute"
            | "other";
          title: string;
          start_time: Timestamp;
          end_time?: Timestamp | null;
          duration_minutes?: number | null;
          quality_score?: number | null;
          notes?: string | null;
          created_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["time_blocks"]["Insert"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "shake" | "other";
          title: string;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "shake" | "other";
          title: string;
          calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
        Relationships: [];
      };
      water_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          logged_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          logged_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["water_logs"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          workout_type: "strength" | "cardio" | "judo" | "mobility" | "walking" | "custom" | null;
          title: string;
          duration_minutes: number | null;
          intensity: "low" | "medium" | "high" | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_type?: "strength" | "cardio" | "judo" | "mobility" | "walking" | "custom" | null;
          title: string;
          duration_minutes?: number | null;
          intensity?: "low" | "medium" | "high" | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      prayer_logs: {
        Row: {
          id: string;
          user_id: string;
          prayer_name: string;
          completed: boolean | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prayer_name: string;
          completed?: boolean | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["prayer_logs"]["Insert"]>;
        Relationships: [];
      };
      meditation_logs: {
        Row: {
          id: string;
          user_id: string;
          duration_minutes: number;
          technique: string | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration_minutes: number;
          technique?: string | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["meditation_logs"]["Insert"]>;
        Relationships: [];
      };
      reading_logs: {
        Row: {
          id: string;
          user_id: string;
          book_title: string | null;
          pages_read: number | null;
          minutes_read: number | null;
          logged_at: Timestamp | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_title?: string | null;
          pages_read?: number | null;
          minutes_read?: number | null;
          logged_at?: Timestamp | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["reading_logs"]["Insert"]>;
        Relationships: [];
      };
      daily_reviews: {
        Row: {
          id: string;
          user_id: string;
          review_date: DateString;
          what_went_well: string | null;
          what_drained_energy: string | null;
          what_to_improve: string | null;
          mood_score: number | null;
          energy_score: number | null;
          focus_score: number | null;
          ai_summary: string | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          review_date: DateString;
          what_went_well?: string | null;
          what_drained_energy?: string | null;
          what_to_improve?: string | null;
          mood_score?: number | null;
          energy_score?: number | null;
          focus_score?: number | null;
          ai_summary?: string | null;
          created_at?: Timestamp | null;
          updated_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["daily_reviews"]["Insert"]>;
        Relationships: [];
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_start: DateString;
          week_end: DateString;
          summary: string | null;
          wins: string | null;
          struggles: string | null;
          suggested_corrections: string | null;
          ai_report: string | null;
          created_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: DateString;
          week_end: DateString;
          summary?: string | null;
          wins?: string | null;
          struggles?: string | null;
          suggested_corrections?: string | null;
          ai_report?: string | null;
          created_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["weekly_reviews"]["Insert"]>;
        Relationships: [];
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          insight_type: string;
          title: string;
          body: string;
          confidence: number | null;
          suggested_action: string | null;
          related_period_start: Timestamp | null;
          related_period_end: Timestamp | null;
          created_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight_type: string;
          title: string;
          body: string;
          confidence?: number | null;
          suggested_action?: string | null;
          related_period_start?: Timestamp | null;
          related_period_end?: Timestamp | null;
          created_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["ai_insights"]["Insert"]>;
        Relationships: [];
      };
      quick_captures: {
        Row: {
          id: string;
          user_id: string;
          raw_text: string;
          parsed_type: string | null;
          parsed_payload: Json | null;
          status:
            | "pending"
            | "parsed"
            | "applied"
            | "failed"
            | "ignored"
            | "needs_confirmation"
            | "confirmed"
            | "cancelled"
            | null;
          created_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_text: string;
          parsed_type?: string | null;
          parsed_payload?: Json | null;
          status?:
            | "pending"
            | "parsed"
            | "applied"
            | "failed"
            | "ignored"
            | "needs_confirmation"
            | "confirmed"
            | "cancelled"
            | null;
          created_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["quick_captures"]["Insert"]>;
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          main_goal: string | null;
          wake_time: string | null;
          sleep_time: string | null;
          water_target_ml: number | null;
          reading_target_minutes: number | null;
          workout_target_weekly: number | null;
          meditation_target_minutes: number | null;
          prayer_tracking_enabled: boolean | null;
          screen_time_limit_minutes: number | null;
          ai_tone: "calm" | "direct" | "strict" | "encouraging" | null;
          ai_recommendation_style: "minimal" | "balanced" | "detailed" | null;
          daily_planning_enabled: boolean | null;
          weekly_report_enabled: boolean | null;
          course_correction_enabled: boolean | null;
          created_at: Timestamp | null;
          updated_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          main_goal?: string | null;
          wake_time?: string | null;
          sleep_time?: string | null;
          water_target_ml?: number | null;
          reading_target_minutes?: number | null;
          workout_target_weekly?: number | null;
          meditation_target_minutes?: number | null;
          prayer_tracking_enabled?: boolean | null;
          screen_time_limit_minutes?: number | null;
          ai_tone?: "calm" | "direct" | "strict" | "encouraging" | null;
          ai_recommendation_style?: "minimal" | "balanced" | "detailed" | null;
          daily_planning_enabled?: boolean | null;
          weekly_report_enabled?: boolean | null;
          course_correction_enabled?: boolean | null;
          created_at?: Timestamp | null;
          updated_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
