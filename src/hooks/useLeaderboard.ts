import { supabase } from "@/integrations/supabase/client";

export const submitScore = async (
  userId: string,
  gameId: string,
  gameName: string,
  score: number
) => {
  try {
    const { error } = await supabase
      .from("leaderboard_scores")
      .insert({
        user_id: userId,
        game_id: gameId,
        game_name: gameName,
        score,
      });

    if (error) {
      console.error("Error submitting score:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error submitting score:", error);
    return false;
  }
};
