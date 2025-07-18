import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

interface NavProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  scrollToSection: (section: string) => void;
}

export default function ResponsiveNav({ isDarkMode, toggleTheme, scrollToSection }: NavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleOverlayClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-bg-color shadow-sm z-[1000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between md:px-6 md:py-4">
        <div className="flex items-center flex-shrink-0">
          <img src="/empireLogo.svg" alt="Empire Logo" className="h-6 md:h-8" />
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('how-it-works')} 
                    className="bg-transparent border-none text-text-color hover:text-primary transition-colors px-2 py-1">
              How It Works
            </button>
            <button onClick={() => scrollToSection('features')}
                    className="bg-transparent border-none text-text-color hover:text-primary transition-colors px-2 py-1">
              Features
            </button>
            <button onClick={() => scrollToSection('rewards')}
                    className="bg-transparent border-none text-text-color hover:text-primary transition-colors px-2 py-1">
              Rewards
            </button>
            <button onClick={() => scrollToSection('top-earners')}
                    className="bg-transparent border-none text-text-color hover:text-primary transition-colors px-2 py-1">
              Top Earners
            </button>
            <button onClick={() => scrollToSection('faq')}
                    className="bg-transparent border-none text-text-color hover:text-primary transition-colors px-2 py-1">
              FAQ
            </button>
            <button onClick={toggleTheme}
                    className="hidden md:flex items-center justify-center p-2 text-text-color hover:text-primary transition-colors"
                    aria-label="Toggle theme">
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="flex items-center">
            <button 
              className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-text-color cursor-pointer z-[1002]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="text-xl leading-none">{isMenuOpen ? '✕' : '☰'}</span>
            </button>

            {/* Mobile Menu Overlay */}
            <div 
              className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] transition-all duration-300 md:hidden
                         ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
              onClick={handleOverlayClick}
            >
              {/* Mobile Menu Panel */}
              <div 
                className={`fixed top-0 right-0 w-[280px] h-screen bg-card-bg shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto z-[1001]
                           ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 flex justify-between items-center p-4 bg-card-bg border-b border-border-color">
                  <span className="text-lg font-semibold text-text-color">Menu</span>
                  <button 
                    className="flex items-center justify-center w-8 h-8 border-none bg-transparent text-text-color cursor-pointer hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col p-2">
                  <button 
                    onClick={() => {
                      scrollToSection('how-it-works');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 my-1 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    How It Works
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('features');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 my-1 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('rewards');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 my-1 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    Rewards
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('top-earners');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 my-1 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    Top Earners
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('faq');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 my-1 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    FAQ
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-color bg-card-bg">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-transparent text-text-color hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3"
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? (
                      <>
                        <FaSun size={18} />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <FaMoon size={18} />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
