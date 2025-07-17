import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from '@formspree/react';
import { FaTwitter, FaTelegramPlane, FaYoutube, FaMoon, FaSun } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import './components/FarcasterAuth.css';
import './components/mobile.css';
import './App.css';
import empireLogo from './assets/empire-logo.jpg';
import Leaderboard from './components/Leaderboard';
import { AuthKitProvider, SignInButton } from '@farcaster/auth-kit';
import '@farcaster/auth-kit/styles.css';


// Google Fonts CDN for Rubik and Inter
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Rubik:wght@400;600;700&display=swap';
document.head.appendChild(fontLink);

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  setModalOpen: (open: boolean) => void;
}

interface FarcasterUser {
  fid: string;
  username: string;
  displayName?: string;
}

function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const [state, handleSubmit] = useForm("mpwlzzaq");
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const [signInError, setSignInError] = useState('');

  const handleSuccess = (data: any) => {
    if (data && data.fid) {
      setFarcasterUser({
        fid: data.fid.toString(),
        username: data.username || `farcaster:${data.fid}`,
        displayName: data.displayName || undefined
      });
      setSignInError('');
    }
  };

  const handleError = (error: { message?: string } | unknown) => {
    console.error('Farcaster sign in error:', error);
    setSignInError('Failed to connect with Farcaster. Please ensure you have a Farcaster account and try again.');
  };

  const [submittedEmails, setSubmittedEmails] = useState<Set<string>>(new Set());

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!farcasterUser) {
      setSignInError('Please sign in with Farcaster first');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const referralSource = formData.get('referral_source');

    if (submittedEmails.has(email)) {
      toast.error('This email is already on the waitlist', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef5350',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '10px',
          padding: '16px',
        },
        icon: '⚠️'
      });
      return;
    }

    // Add timestamp to track when users join
    formData.append('timestamp', new Date().toISOString());
    
    // Add referral data
    if (referralSource) {
      formData.append('referred_by', referralSource as string);
    }

    await handleSubmit(e);
    
    // Form submission was successful if there are no errors
    if (!state.errors) {
      setSubmittedEmails(prev => new Set([...prev, email]));
      
      // Show success toast with referral info if applicable
      const message = referralSource 
        ? "🎉 You've joined the waitlist! Referral bonus will be credited."
        : "🎉 You've joined the waitlist!";
        
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '10px',
          padding: '16px'
        }
      });
    }
  };

  if (!open) return null;

  return (
    <div className="modal-bg" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Join the Waitlist</h2>
        {!farcasterUser ? (
          <div className="farcaster-signin">
            <p className="signin-info">Connect your Farcaster account to join the waitlist</p>
            <SignInButton
              onSuccess={handleSuccess}
              onError={handleError}
            />
            {signInError && <p className="error-message">{signInError}</p>}
          </div>
        ) : (
          <div>
            <form onSubmit={handleFormSubmit} className="waitlist-form">
              <div className="farcaster-info">
                <p>Signed in as: {farcasterUser?.username}</p>
              </div>
              <label htmlFor="waitlist-email">Email Address</label>
              <input
                type="email"
                id="waitlist-email"
                name="email"
                required
                placeholder="your@email.com"
                className="input"
              />
              <input
                type="hidden"
                name="farcaster_id"
                value={farcasterUser?.fid}
              />
              <input
                type="hidden"
                name="farcaster_username"
                value={farcasterUser?.username}
              />
              <input
                type="hidden"
                name="farcaster_display_name"
                value={farcasterUser?.displayName || ''}
              />
              <input
                type="hidden"
                name="referral_source"
                value={new URLSearchParams(window.location.search).get('ref') || ''}
              />
              <button type="submit" className="register-btn" disabled={state.submitting}>
                {state.submitting ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
            
            <div className="share-section">
              <h3>Share with friends to earn points!</h3>
              <p>Get bonus rewards when your friends join using your referral link</p>
              <button 
                className="share-button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}?ref=${farcasterUser?.fid}`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Referral link copied to clipboard!', {
                    duration: 2000,
                    position: 'bottom-center',
                  });
                }}
              >
                Copy Referral Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Hero({ openModal }: { openModal: () => void }) {
  return (
    <div className="hero-bg">
      <div className="hero-content">
        <div className="logo-box">
          <img src={empireLogo} alt="KnowEmpire Logo" className="hero-logo" />
        </div>
        <h1 className="hero-title">KnowEmpire</h1>
        <p className="hero-subtitle">The First P2P Marketplace Built on Farcaster</p>
        <button className="enter-button" onClick={openModal}>Join the Waitlist</button>
      </div>
    </div>
  );
}

function HowItWorks() {
  // SVG icons for better visibility
  const icons = [
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#6C47FF" xmlns="http://www.w3.org/2000/svg"><path d="M17 7h-2v2h2v8H7V9h2V7H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M12 3v8" stroke="#6C47FF" strokeWidth="2" strokeLinecap="round"/></svg>,
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#00BFAE" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>,
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFB300" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="12" height="8" rx="2"/><path d="M12 6v4" stroke="#FFB300" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="6" r="2" fill="#FFB300"/></svg>,
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#43A047" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#43A047"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ];
  const steps = [
    {
      title: 'Connect Farcaster',
      desc: 'Sign in with your Farcaster account to access the marketplace and start trading securely.',
      icon: icons[0]
    },
    {
      title: 'List Your Item/Service',
      desc: 'Create a listing for your product or service. Set your price and details for buyers to view.',
      icon: icons[1]
    },
    {
      title: 'Secure Escrow Transaction',
      desc: 'Funds are held in escrow until the transaction is completed, protecting both parties.',
      icon: icons[2]
    },
    {
      title: 'Complete & Review',
      desc: 'Once the item/service is delivered, release payment and leave a review for your experience.',
      icon: icons[3]
    }
  ];
  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="how-cards">
        {steps.map((step, idx) => (
          <motion.div className="how-card" key={idx} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 + idx * 0.1 }}>
            <span className="how-icon">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: "$KNOW Token Live",
      description: "Marketplace powered by $KNOW token for rewards and payments.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#6C47FF"
    },
    {
      title: "Escrow Powered",
      description: "All trades use secure escrow for buyer and seller protection.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9v2c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2V9c0-3.87-3.13-7-7-7zm5 9H7V9c0-2.76 2.24-5 5-5s5 2.24 5 5v2z" fill="currentColor"/>
        </svg>
      ),
      color: "#00BFAE"
    },
    {
      title: "Farcaster Community",
      description: "Built for Farcaster users to trade, earn, and connect.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
      ),
      color: "#FFB300"
    },
    {
      title: "Trade Goods & Services",
      description: "List and buy physical, digital, or service offerings.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" fill="currentColor"/>
        </svg>
      ),
      color: "#43A047"
    },
    {
      title: "Earn Trustlessly",
      description: "Earn rewards and reputation with every transaction.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#E91E63"
    }
  ];

  return (
    <section className="features">
      <h2>Features</h2>
      <div className="feature-cards">
        {features.map((feature, idx) => (
          <motion.div
            className="feature-card"
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <span className="feature-icon" style={{ '--feature-color': feature.color } as React.CSSProperties}>
              {feature.icon}
            </span>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      q: 'Already a seller or service provider?',
      a: 'Register to Sell or Register as Buyer.'
    },
    {
      q: 'How do I join?',
      a: "Click 'Join the Waitlist' and enter your email."
    },
    {
      q: 'What is $KNOW?',
      a: '$KNOW token is live and powers the marketplace and rewards.'
    },
    {
      q: 'Is escrow mandatory?',
      a: 'Yes, escrow is used for all transactions to ensure safety.'
    },
    {
      q: 'Can I sell digital products?',
      a: 'Yes, you can sell goods, services, or digital products.'
    }
  ];
  return (
    <section className="faq">
      <h2>FAQ</h2>
      <div className="faq-list">
        {faqs.map((item, idx) => (
          <div className={`faq-item${openIndex === idx ? ' open' : ''}`} key={idx}>
            <button className="faq-question" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
              <span>{item.q}</span>
              <span className="faq-arrow" style={{marginLeft:'auto'}}>{openIndex === idx ? '▲' : '▼'}</span>
            </button>
            <motion.div
              className="faq-answer"
              initial={{ height: 0, opacity: 0 }}
              animate={openIndex === idx ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {openIndex === idx && <div>{item.a}</div>}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface RewardCardProps {
  title: string;
  subtitle: string;
  description: string;
}

function RewardCard({ title, subtitle, description }: RewardCardProps) {
  return (
    <motion.div
      className="reward-card"
      initial={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(108,71,255,0.15)' }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="reward-card-header">
        <span className="reward-icon">
          {title === 'Daily Streaks' && <svg width="28" height="28" viewBox="0 0 24 24" fill="#6C47FF" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="4"/><rect x="7" y="8" width="10" height="2" fill="#fff"/><rect x="7" y="12" width="6" height="2" fill="#fff"/></svg>}
          {title === 'Referral Program' && <svg width="28" height="28" viewBox="0 0 24 24" fill="#00BFAE" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {title === 'Special Events' && <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFB300" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z"/></svg>}
        </span>
        <div>
          <h2 className="reward-title">{title}</h2>
          <h3 className="reward-subtitle">{subtitle}</h3>
        </div>
      </div>
      <p className="reward-desc">{description}</p>
    </motion.div>
  );
}



interface NavigationProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

function Navigation({ toggleTheme, isDarkMode }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="nav-bar">
      <div className="nav-content">
        <div className="nav-logo">
          <img src={empireLogo} alt="Empire Logo" className="nav-logo-img" />
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="nav-links">
            <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('rewards')}>Rewards</button>
            <button onClick={() => scrollToSection('top-earners')}>Top Earners</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
            <button className="theme-toggle desktop" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
            <div className={`nav-links ${isMenuOpen ? 'nav-open' : ''}`} onClick={() => setIsMenuOpen(false)}>
              <div className="nav-menu" onClick={(e) => e.stopPropagation()}>
                <div className="nav-menu-header">
                  <span className="nav-menu-title">Menu</span>
                  <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(false)}>✕</button>
                </div>
                <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
                <button onClick={() => scrollToSection('features')}>Features</button>
                <button onClick={() => scrollToSection('rewards')}>Rewards</button>
                <button onClick={() => scrollToSection('top-earners')}>Top Earners</button>
                <button onClick={() => scrollToSection('faq')}>FAQ</button>
              </div>
            </div>
            <button className="theme-toggle mobile" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function ScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button className="scroll-to-top" onClick={scrollToTop}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4l-8 8h6v8h4v-8h6l-8-8z" fill="currentColor"/>
      </svg>
    </button>
  );
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <AuthKitProvider
      config={{
        domain: window.location.host,
        siweUri: `${window.location.origin}/login`,
        rpcUrl: "https://mainnet.optimism.io",
        relay: "https://relay.farcaster.xyz",
        version: "v1"
      }}
    >
      <Toaster />
      <div className={`app ${darkMode ? 'dark-theme' : ''}`}>
        <Navigation toggleTheme={toggleTheme} isDarkMode={darkMode} />
        <Hero openModal={handleModalOpen} />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="features">
        <Features />
      </section>
      <section id="rewards" className="rewards">
        <h2 className="section-title">Empire Rewards</h2>
        <p className="section-subtitle">Unlock exclusive benefits</p>
        <div className="rewards-grid">
          {[
            {
              title: 'Daily Streaks',
              subtitle: 'Earn every day',
              description: 'Log in daily to build your streak and earn bonus rewards.'
            },
            {
              title: 'Referral Program',
              subtitle: 'Invite & Earn',
              description: 'Invite friends and receive a percentage of their rewards.'
            },
            {
              title: 'Special Events',
              subtitle: 'Limited Time',
              description: 'Participate in special events for exclusive prizes and badges.'
            }
          ].map(reward => (
            <RewardCard
              key={reward.title}
              {...reward}
            />
          ))}
        </div>
      </section>
      <Leaderboard />
      <section id="faq">
        <FAQ />
      </section>
      <WaitlistModal open={modalOpen} onClose={handleModalClose} setModalOpen={setModalOpen} />
      <footer>
        <div className="footer-content">
          <div className="footer-icons">
            <a href="https://x.com/KnowEmpire" target="_blank" rel="noopener noreferrer">
              <FaTwitter size={28} />
            </a>
            <a href="https://t.me/+TPP36QO0JwYzNDJk" target="_blank" rel="noopener noreferrer">
              <FaTelegramPlane size={28} />
            </a>
            <a href="https://youtube.com/@know-empire?si=FRa7oDUTDaSTcnKe" target="_blank" rel="noopener noreferrer">
              <FaYoutube size={28} />
            </a>
          </div>
          <div className="copyright">
            © 2025 KnowEmpire. All rights reserved.
          </div>
          <ScrollToTop />
        </div>
      </footer>
    </div>
  </AuthKitProvider>
);
}

export default App;
