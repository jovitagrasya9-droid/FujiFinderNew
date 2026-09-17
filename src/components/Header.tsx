import React, { useState, useEffect } from 'react';
import { Search, Menu, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { FujiFinderLogo } from './FujiFinderLogo';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, filter?: string) => void;
  onOpenSearch: () => void;
  onOpenCMS: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenCMS,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Cameras', id: 'cameras' },
    { label: 'Guides', id: 'guides' },
    { label: 'Blog', id: 'blog' },
  ];

  return (
    <header
      id="main-navigation-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/90 backdrop-blur-md py-3 shadow-lg border-b border-neutral-800/80'
          : 'bg-gradient-to-b from-neutral-950/80 via-neutral-950/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center text-white group cursor-pointer focus:outline-none"
        >
          <FujiFinderLogo variant="light" size="md" showTagline={false} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`relative py-1 font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right actions: Search and "Explore Cameras" pill */}
        <div className="flex items-center gap-3">
          <button
            id="nav-search-button"
            onClick={onOpenSearch}
            title="Search cameras, guides, and reviews (Cmd+K)"
            className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="nav-explore-cameras-cta"
            onClick={() => onNavigate('cameras')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold bg-white text-neutral-950 hover:bg-neutral-100 hover:shadow-md transition-all cursor-pointer tracking-wide"
          >
            Explore Cameras
          </button>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-200 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/95 border-b border-neutral-800 px-5 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onNavigate('cameras');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-full text-sm font-semibold bg-white text-neutral-950 text-center"
            >
              Explore Cameras
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
