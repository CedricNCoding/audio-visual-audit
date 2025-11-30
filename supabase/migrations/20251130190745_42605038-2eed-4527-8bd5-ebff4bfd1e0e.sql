-- Create ai_settings table for storing AI configuration
CREATE TABLE public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT DEFAULT 'openai',
  model_name TEXT DEFAULT 'gpt-4.1-2025-04-14',
  api_key TEXT,
  max_hdmi_m NUMERIC DEFAULT 5,
  max_hdbaset_m NUMERIC DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_settings
CREATE POLICY "Users can manage their own AI settings"
ON public.ai_settings
FOR ALL
USING (auth.uid() = user_id);

-- Add AI analysis fields to rooms table
ALTER TABLE public.rooms
ADD COLUMN audio_config_ia JSONB,
ADD COLUMN warnings_ia TEXT[],
ADD COLUMN critical_errors_ia TEXT[],
ADD COLUMN debug_ia TEXT[],
ADD COLUMN resume_technique_ia TEXT;