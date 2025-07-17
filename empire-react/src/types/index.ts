export interface FarcasterUser {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
}

export interface LeaderboardEntry extends FarcasterUser {
  referralCount: number;
  points: number;
}

export interface ReferralData {
  referrer: FarcasterUser;
  referee: string;  // Email address
  timestamp: number;
}

export interface WalletClientState {
  loading: boolean;
  error?: Error;
  client: any;  // WalletConnectClient type from @farcaster/auth-kit
}
