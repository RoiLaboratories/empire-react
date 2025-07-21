-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    farcaster_id TEXT NOT NULL UNIQUE,
    farcaster_username TEXT NOT NULL,
    farcaster_display_name TEXT,
    referral_source TEXT REFERENCES waitlist(farcaster_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_farcaster_id ON public.waitlist(farcaster_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral_source ON public.waitlist(referral_source);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get referral counts
CREATE OR REPLACE FUNCTION get_referral_counts()
RETURNS TABLE (
    farcaster_id TEXT,
    referral_count BIGINT
) AS $$
    SELECT 
        farcaster_id,
        COUNT(*) as referral_count
    FROM waitlist
    WHERE farcaster_id IS NOT NULL
        AND referral_source IS NOT NULL
    GROUP BY farcaster_id;
$$ LANGUAGE sql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist table
-- Allow any authenticated user to insert their own entry
CREATE POLICY "Enable insert for authenticated users only" ON public.waitlist 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

-- Allow any user to view waitlist entries (for leaderboard)
CREATE POLICY "Enable read access for all users" ON public.waitlist 
    FOR SELECT TO public 
    USING (true);

-- Only allow updates by the owner of the entry
CREATE POLICY "Enable update for users based on email" ON public.waitlist 
    FOR UPDATE TO authenticated 
    USING (auth.uid()::text = farcaster_id);

-- Comment on table and columns
COMMENT ON TABLE public.waitlist IS 'Table storing waitlist entries and referral information';
COMMENT ON COLUMN public.waitlist.id IS 'Unique identifier for the waitlist entry';
COMMENT ON COLUMN public.waitlist.email IS 'User''s email address';
COMMENT ON COLUMN public.waitlist.farcaster_id IS 'User''s Farcaster ID';
COMMENT ON COLUMN public.waitlist.farcaster_username IS 'User''s Farcaster username';
COMMENT ON COLUMN public.waitlist.farcaster_display_name IS 'User''s Farcaster display name';
COMMENT ON COLUMN public.waitlist.referral_source IS 'Farcaster ID of the user who referred this entry';
COMMENT ON COLUMN public.waitlist.created_at IS 'Timestamp when the entry was created';
COMMENT ON COLUMN public.waitlist.updated_at IS 'Timestamp when the entry was last updated';
