import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  farcasterUser: {
    fid: string;
    username: string;
  } | null;
}

export function ShareModal({ open, onClose, farcasterUser }: ShareModalProps) {
  const referralLink = farcasterUser ? `${window.location.origin}?ref=${farcasterUser.fid}` : '';
  const farcasterUrl = `https://warpcast.com/~/compose?text=I%20just%20joined%20the%20@knowempire%20waitlist%20and%20earned%20100%20$KNOW%20points!%20🎉%0A%0AJoin%20now%20and%20grab%20yours%20too!&embeds[]=${referralLink}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!', {
      duration: 2000,
      position: 'bottom-center',
    });
  };

  return (
    <AnimatePresence>
      {open && farcasterUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-xl relative z-10"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", bounce: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              onClick={onClose}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
              Share Your Journey! 🚀
            </h2>
            
            <div className="space-y-8">
              {/* Farcaster Share Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Share with friends to earn points
                </h3>
                <a 
                  href={farcasterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#6C47FF] to-[#8A6FFF] text-white font-medium hover:from-[#5A35FF] hover:to-[#7859FF] transition-all duration-200 transform hover:-translate-y-0.5 shadow-md"
                >
                  Share on Farcaster
                </a>
              </div>

              {/* Referral Link Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Get bonus rewards when your friends join using your referral link
                </h3>
                <button 
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md"
                >
                  Copy Referral Link
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
