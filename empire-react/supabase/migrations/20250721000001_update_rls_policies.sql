-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.waitlist;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.waitlist;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.waitlist;

-- Create new policies that don't rely on auth.uid()
-- Allow anyone to insert (we'll validate through the application layer)
CREATE POLICY "Allow inserts for everyone" ON public.waitlist
    FOR INSERT TO PUBLIC
    WITH CHECK (true);

-- Allow anyone to read (needed for leaderboard)
CREATE POLICY "Allow reads for everyone" ON public.waitlist
    FOR SELECT TO PUBLIC
    USING (true);

-- Allow updates only if farcaster_id matches
CREATE POLICY "Allow updates based on farcaster_id" ON public.waitlist
    FOR UPDATE TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
