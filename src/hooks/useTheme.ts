import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("qurify-theme") as Theme;
      if (stored) return stored;
      return document.body.classList.contains("dark") ? "dark" : "light";
    }
    return "dark";
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Apply theme to body
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("qurify-theme", theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Try to save to database if user is logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: existing } = await supabase
          .from("user_preferences")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (existing) {
          await supabase
            .from("user_preferences")
            .update({ theme: newTheme })
            .eq("user_id", session.user.id);
        } else {
          await supabase
            .from("user_preferences")
            .insert({ user_id: session.user.id, theme: newTheme });
        }
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Load theme from database on mount if user is logged in
  useEffect(() => {
    const loadThemeFromDb = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("user_preferences")
            .select("theme")
            .eq("user_id", session.user.id)
            .single();
          
          if (data?.theme) {
            setThemeState(data.theme as Theme);
          }
        }
      } catch (error) {
        // User might not have preferences yet, that's okay
      }
    };

    loadThemeFromDb();
  }, []);

  return { theme, setTheme, toggleTheme, isLoading };
};

export default useTheme;