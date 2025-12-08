import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserPreferences {
  theme: string;
  notifications_enabled: boolean;
  auto_verify_links: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: "dark",
  notifications_enabled: true,
  auto_verify_links: false,
  email_notifications: true,
  push_notifications: false,
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          
          const { data, error } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (data) {
            setPreferences({
              theme: data.theme,
              notifications_enabled: data.notifications_enabled,
              auto_verify_links: data.auto_verify_links,
              email_notifications: data.email_notifications,
              push_notifications: data.push_notifications,
            });
          } else if (error && error.code === "PGRST116") {
            // No preferences exist, create default
            await supabase.from("user_preferences").insert({
              user_id: session.user.id,
              ...defaultPreferences,
            });
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadPreferences();
      } else {
        setUserId(null);
        setPreferences(defaultPreferences);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));

    if (userId) {
      try {
        const { error } = await supabase
          .from("user_preferences")
          .update({ [key]: value })
          .eq("user_id", userId);

        if (error) {
          // Try insert if update fails (no row exists)
          await supabase.from("user_preferences").insert({
            user_id: userId,
            [key]: value,
          });
        }
      } catch (error) {
        console.error("Error updating preference:", error);
        toast.error("Failed to save preference");
      }
    }
  };

  const requestPushNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications not supported in this browser");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await updatePreference("push_notifications", true);
        toast.success("Push notifications enabled!");
        return true;
      } else {
        toast.error("Permission denied for notifications");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notifications:", error);
      toast.error("Failed to enable notifications");
      return false;
    }
  };

  return {
    preferences,
    isLoading,
    updatePreference,
    requestPushNotifications,
    isLoggedIn: !!userId,
  };
};

export default useUserPreferences;