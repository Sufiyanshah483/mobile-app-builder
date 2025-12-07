-- Create achievements table
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table for tracking unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('First Step', 'Complete your first verification', '🎯', 'verification', 'verification_count', 1, 10),
('Fact Finder', 'Complete 10 verifications', '🔍', 'verification', 'verification_count', 10, 25),
('Truth Seeker', 'Complete 50 verifications', '⚡', 'verification', 'verification_count', 50, 50),
('Myth Buster', 'Complete 100 verifications', '💎', 'verification', 'verification_count', 100, 100),
('Game On', 'Play your first inoculation game', '🎮', 'games', 'games_played', 1, 10),
('Quick Learner', 'Score 80+ in any game', '📚', 'games', 'high_score', 80, 25),
('Master Mind', 'Score 100 in any game', '🧠', 'games', 'perfect_score', 100, 50),
('Hat Trick', 'Complete all 3 games', '🎩', 'games', 'games_completed', 3, 75),
('Rising Star', 'Reach Level 5', '⭐', 'progress', 'level_reached', 5, 30),
('Expert', 'Reach Level 10', '🌟', 'progress', 'level_reached', 10, 75),
('Guardian', 'Reach 500 resilience score', '🛡️', 'progress', 'resilience_score', 500, 50),
('Champion', 'Reach #1 on any leaderboard', '🏆', 'leaderboard', 'leaderboard_rank', 1, 100);