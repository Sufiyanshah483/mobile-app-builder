-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on daily_challenges
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing daily challenges (anyone can view)
CREATE POLICY "Anyone can view active daily challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (is_active = true);

-- Create user_daily_challenges table for tracking completion
CREATE TABLE public.user_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

-- Enable RLS on user_daily_challenges
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for user daily challenges
CREATE POLICY "Users can view their own daily challenge progress" 
ON public.user_daily_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily challenge progress" 
ON public.user_daily_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily challenge progress" 
ON public.user_daily_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert some default daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, points, difficulty) VALUES
('Quick Verify', 'Verify one news article using the Trust Score tool', 'verification', 10, 'easy'),
('Claim Detective', 'Use the Claim Scanner to verify a quote or statement', 'verification', 15, 'easy'),
('Media Sleuth', 'Check an image or video for authenticity', 'verification', 15, 'medium'),
('Game Master', 'Complete one Inoculation Game with a score of 70% or higher', 'game', 20, 'medium'),
('Share Knowledge', 'Share Qurify with a friend to help spread digital literacy', 'social', 25, 'easy');