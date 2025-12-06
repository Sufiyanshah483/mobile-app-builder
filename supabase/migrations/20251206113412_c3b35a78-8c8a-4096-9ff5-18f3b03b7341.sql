-- Create a leaderboard_scores table for tracking scores with timestamps
CREATE TABLE public.leaderboard_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view leaderboard scores (public leaderboard)
CREATE POLICY "Anyone can view leaderboard scores"
ON public.leaderboard_scores
FOR SELECT
USING (true);

-- Users can create their own leaderboard entries
CREATE POLICY "Users can create their own scores"
ON public.leaderboard_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_leaderboard_scores_game_created ON public.leaderboard_scores(game_id, created_at DESC);
CREATE INDEX idx_leaderboard_scores_user ON public.leaderboard_scores(user_id);

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_scores;