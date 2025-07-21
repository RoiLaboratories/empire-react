import { createClient } from '@supabase/supabase-js';
import type { PostgrestResponse } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ReferralCount {
  farcaster_id: string;
  referral_count: number;
}

export interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  referralCount: number;
  points: number;
  timestamp?: string;
}

export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    // Get referral counts from database using a raw count query
    const { data: referralCounts, error: countError } = await supabase
      .rpc('get_referral_counts') as PostgrestResponse<ReferralCount>;

    if (countError) throw countError;
    if (!referralCounts) return [];

    // Get user details
    const { data: users, error: userError } = await supabase
      .from('waitlist')
      .select('farcaster_id, farcaster_username, farcaster_display_name')
      .in('farcaster_id', referralCounts.map(r => r.farcaster_id));

    if (userError) throw userError;
    if (!users) return [];

    // Map to user details for quick lookup
    const userMap = new Map(
      users.map(user => [
        user.farcaster_id, 
        { 
          username: user.farcaster_username, 
          displayName: user.farcaster_display_name 
        }
      ])
    );

    // Convert to leaderboard entries
    const leaderboard = referralCounts.map(entry => {
      const user = userMap.get(entry.farcaster_id);
      return {
        fid: parseInt(entry.farcaster_id),
        username: user?.username || entry.farcaster_id,
        displayName: user?.displayName,
        referralCount: entry.referral_count,
        points: entry.referral_count * 100, // 100 points per referral
        timestamp: new Date().toISOString()
      };
    }).sort((a, b) => b.points - a.points);

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
}

export function subscribeToLeaderboardUpdates(callback: (data: LeaderboardEntry[]) => void): () => void {
  // Subscribe to real-time changes on the waitlist table
  const subscription = supabase
    .channel('waitlist_changes')
    .on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'waitlist'
      },
      async () => {
        // Fetch updated leaderboard data when changes occur
        try {
          const data = await fetchLeaderboardData();
          callback(data);
        } catch (error) {
          console.error('Error updating leaderboard:', error);
        }
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}
