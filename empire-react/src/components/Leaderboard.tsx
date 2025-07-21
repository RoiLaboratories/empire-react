import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './Leaderboard.css';
import styles from './Leaderboard.module.css';
import { getLeaderboardData, subscribeToLeaderboardUpdates } from '../lib/database';

interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  referralCount: number;
  points: number;
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [error, setError] = useState<string | null>(null);

  const handleLeaderboardUpdate = useCallback((data: LeaderboardEntry[]) => {
    setLeaderboard(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initializeLeaderboard = async () => {
      try {
        // Initial fetch
        const data = await getLeaderboardData();
        setLeaderboard(data);
        setIsLoading(false);

        // Subscribe to real-time updates
        cleanup = subscribeToLeaderboardUpdates(async () => {
          // Fetch fresh data when changes occur
          const updatedData = await getLeaderboardData();
          setLeaderboard(updatedData);
        });
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError('Failed to load leaderboard data. Please try again later.');
        setIsLoading(false);
      }
    };

    initializeLeaderboard();

    // Cleanup subscription when component unmounts
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleLeaderboardUpdate]);

  const getMedalIcon = (rank: number) => {
    const size = window.innerWidth < 768 ? 18 : 24;
    switch (rank) {
      case 1:
        return (
          <svg className="medal gold" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#FFD700"/>
          </svg>
        );
      case 2:
        return (
          <svg className="medal silver" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#C0C0C0" stroke="#C0C0C0"/>
          </svg>
        );
      case 3:
        return (
          <svg className="medal bronze" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#CD7F32" stroke="#CD7F32"/>
          </svg>
        );
      default:
        return <span className="rank-number text-sm md:text-base">{rank}</span>;
    }
  };

  if (error) {
    return (
      <section id="top-earners" className="leaderboard">
        <h2 className="section-title">Leaderboard</h2>
        <p className="section-subtitle">Leading the Empire's Growth</p>
        <div className="leaderboard-error">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="top-earners" className="leaderboard">
        <h2 className="section-title">Leaderboard</h2>
        <p className="section-subtitle">Leading the Empire's Growth</p>
        <div className="leaderboard-loading">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading leaderboard...
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="top-earners" className="leaderboard">
      <div className="leaderboard-wrapper">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Leaderboard
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Leading earners and their achievements
        </motion.p>
        {/* Responsive View */}
        {!isMobile ? (
          <div className="leaderboard-table-container">
            <div className="leaderboard-grid">
              <div className="leaderboard-header">
                <div>Rank</div>
                <div>User</div>
                <div>Referrals</div>
                <div>Points</div>
              </div>
              {leaderboard.map((entry, index) => (
                <div key={entry.fid} className="leaderboard-row">
                  <div>
                    {getMedalIcon(index + 1)}
                  </div>
                  <div>
                    <motion.div
                      className="user-info"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <span className="username">@{entry.username}</span>
                      {entry.displayName && (
                        <span className="display-name">{entry.displayName}</span>
                      )}
                    </motion.div>
                  </div>
                  <div>
                    <span className="stat-value">{entry.referralCount}</span>
                  </div>
                  <div>
                    <span className="stat-value">{entry.points.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.wrapper}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.headerCell}>Rank</th>
                    <th className={styles.headerCell}>User</th>
                    <th className={styles.headerCell}>Referrals</th>
                    <th className={styles.headerCell}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry.fid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <td className={styles.bodyCell}>
                        {getMedalIcon(index + 1)}
                      </td>
                      <td className={styles.bodyCell}>
                        <div className="user-info">
                          <span className="username">@{entry.username}</span>
                          {entry.displayName && (
                            <span className="display-name">{entry.displayName}</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.bodyCell}>
                        <span className="stat-value">{entry.referralCount}</span>
                      </td>
                      <td className={styles.bodyCell}>
                        <span className="stat-value">{entry.points.toLocaleString()}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Leaderboard;
