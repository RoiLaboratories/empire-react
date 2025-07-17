interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  referralCount: number;
  points: number;
}

interface ReferralData {
  referrer: string; // Farcaster FID
  referee: string;  // Email address
  timestamp: number;
}

class LeaderboardService {
  private referrals: ReferralData[] = [];

  addReferral(referrer: string, referee: string) {
    this.referrals.push({
      referrer,
      referee,
      timestamp: Date.now()
    });
  }

  getLeaderboard(): LeaderboardEntry[] {
    // Group referrals by referrer
    const referralCounts = new Map<string, number>();
    this.referrals.forEach(referral => {
      const count = referralCounts.get(referral.referrer) || 0;
      referralCounts.set(referral.referrer, count + 1);
    });

    // Convert to array and sort
    return Array.from(referralCounts.entries())
      .map(([fid, count]) => ({
        fid: parseInt(fid),
        username: `user${fid}`, // Replace with actual Farcaster username lookup
        referralCount: count,
        points: count * 10 // 10 points per referral
      }))
      .sort((a, b) => b.points - a.points);
  }
}

export const leaderboardService = new LeaderboardService();
export type { LeaderboardEntry, ReferralData };
