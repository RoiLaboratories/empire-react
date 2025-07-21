import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

console.log('Initializing Supabase with URL:', supabaseUrl?.substring(0, 20) + '...');

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist since we're using Farcaster auth
    autoRefreshToken: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

export interface WaitlistEntry {
  id?: number;
  created_at?: string;
  email: string;
  farcaster_display_name: string | null;
  farcaster_id: string;
  farcaster_username: string;
  referral_source: string | null;
}

export interface DatabaseRow {
  farcaster_id: string;
  farcaster_username: string;
  farcaster_display_name: string | null;
  referral_source: string | null;
}

// Function to submit waitlist entry
export async function submitWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'created_at'>) {
  try {
    console.log('Submitting entry:', entry); // Debug log

    const { data, error } = await supabase
      .from('waitlist')
      .insert([entry])
      .select('*');

    if (error) {
      console.error('Supabase error:', error); // Debug log
      if (error.code === '23505') { // Unique violation
        throw new Error('This email or Farcaster ID is already registered');
      }
      if (error.code === '42501') { // RLS violation
        throw new Error('Permission denied. Please sign in again.');
      }
      throw error;
    }

    console.log('Success response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('submitWaitlistEntry error:', error);
    throw error;
  }
}

// Function to check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    console.log('Checking email:', email); // Debug log

    const { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Email check error:', error); // Debug log
      if (error.code === '42501') { // RLS violation
        throw new Error('Permission denied. Please sign in again.');
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('checkEmailExists error:', error);
    throw error;
  }
}

// Function to get referral count
export async function getReferralCount(farcaster_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .eq('referral_source', farcaster_id);

  if (error) throw error;
  return count || 0;
}

// Function to get leaderboard data
export async function getLeaderboardData() {
  const { data, error } = await supabase
    .from('waitlist')
    .select(`
      farcaster_id,
      farcaster_username,
      farcaster_display_name,
      referral_source
    `) as { data: DatabaseRow[] | null; error: Error | null };

  if (error) throw error;
  if (!data) return [];

  // Process the data to count referrals
  const referralCounts = new Map<string, number>();
  data.forEach((entry: DatabaseRow) => {
    if (entry.referral_source) {
      referralCounts.set(
        entry.referral_source,
        (referralCounts.get(entry.referral_source) || 0) + 1
      );
    }
  });

  // Create leaderboard entries
  const leaderboard = Array.from(new Set(data.map((entry: DatabaseRow) => entry.farcaster_id)))
    .map((fid: string) => {
      const userEntry = data.find((entry: DatabaseRow) => entry.farcaster_id === fid);
      return {
        fid: parseInt(fid),
        username: userEntry?.farcaster_username || '',
        displayName: userEntry?.farcaster_display_name || undefined,
        referralCount: referralCounts.get(fid) || 0,
        points: (referralCounts.get(fid) || 0) * 100 // 100 points per referral
      };
    })
    .sort((a, b) => b.points - a.points);

  return leaderboard;
}

// Subscribe to realtime changes
export function subscribeToLeaderboardUpdates(callback: () => void): () => void {
  const subscription = supabase
    .channel('waitlist_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'waitlist'
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
