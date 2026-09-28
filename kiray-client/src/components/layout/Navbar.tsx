'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  Heart,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  Building,
  ShieldAlert,
  KeyRound,
  Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { logoutFirebase } from '@/features/auth/firebase';
import { useFavorites } from '@/features/favorites';
import { baseApi } from '@/store/baseApi';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';

export interface NavbarProps {
  favoritesCount?: number;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onOpenCreateListing?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenSafetyTips?: () => void;
  onSwitchDemoRole?: (role: 'rentee' | 'landlord' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoritesCount = 0,
  onOpenAuth,
  onOpenCreateListing,
  onOpenHowItWorks,
  onOpenSafetyTips,
  onSwitchDemoRole,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const { savedCount } = useFavorites();
  const { t } = useTranslation();

  const effectiveFavoritesCount =
    favoritesCount > 0 ? favoritesCount : currentUser ? savedCount : 0;

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    try {
      await logoutFirebase();
    } catch {
      // ignore
    }
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    router.push('/');
  };

  const handlePostListingClick = () => {
    if (!currentUser) {
      if (onOpenAuth) {
        onOpenAuth('register');
      } else {
        router.push('/register?role=landlord');
      }
    } else {
      if (onOpenCreateListing) {
        onOpenCreateListing();
      } else {
        router.push('/dashboard/landlord/listings/new');
      }
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="focus:outline-none select-none">
            <Logo showMotto={true} size="md" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-stone-50/90 hover:bg-stone-50 border border-stone-200/80 p-1.5 rounded-full shadow-2xs transition-colors">
          <Link
            id="nav-link-home"
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 select-none whitespace-nowrap ${
              isActive('/')
                ? 'bg-white text-orange-600 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            {t.common.home}
          </Link>

          <Link
            id="nav-link-browse"
            href="/listings"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 select-none whitespace-nowrap ${
              isActive('/listings')
                ? 'bg-white text-orange-600 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            {t.common.browseProperties}
          </Link>

          {/* Role-specific dashboard links */}
          {currentUser?.role === 'landlord' && (
            <Link
              id="nav-link-landlord-dash"
              href="/dashboard/landlord"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 select-none whitespace-nowrap ${
                isActive('/dashboard/landlord')
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-orange-600" />
              <span>{t.navbar.ownerDashboard}</span>
            </Link>
          )}

          {currentUser?.role === 'rentee' && (
            <Link
              id="nav-link-rentee-dash"
              href="/dashboard/rentee"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 select-none whitespace-nowrap ${
                isActive('/dashboard/rentee')
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>{t.navbar.renteeHub}</span>
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              id="nav-link-admin-dash"
              href="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 select-none whitespace-nowrap ${
                isActive('/admin')
                  ? 'bg-white text-orange-600 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
              <span>{t.navbar.adminConsole}</span>
            </Link>
          )}

          {/* Divider between core & info links */}
          <div className="h-4 w-px bg-stone-200/80 mx-1" />

          {/* Info anchors / modals */}
          {onOpenHowItWorks ? (
            <button
              id="nav-link-how-it-works"
              onClick={onOpenHowItWorks}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-all duration-150 cursor-pointer select-none whitespace-nowrap"
            >
              {t.common.howItWorks}
            </button>
          ) : (
            <Link
              id="nav-link-how-it-works"
              href="/#how-it-works"
              className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-all duration-150 select-none whitespace-nowrap"
            >
              {t.common.howItWorks}
            </Link>
          )}

          {onOpenSafetyTips ? (
            <button
              id="nav-link-safety-tips"
              onClick={onOpenSafetyTips}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-all duration-150 cursor-pointer select-none whitespace-nowrap"
            >
              {t.common.safetyTips}
            </button>
          ) : (
            <Link
              id="nav-link-safety-tips"
              href="/#safety-tips"
              className="px-3 py-1.5 rounded-full text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-white/60 transition-all duration-150 select-none whitespace-nowrap"
            >
              {t.common.safetyTips}
            </Link>
          )}

          {/* Community Pill */}
          <a
            id="nav-link-community"
            href="https://t.me/+0rRmPUoe0TgxYTQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50/80 hover:bg-sky-100 border border-sky-200/60 transition-all select-none whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.navbar.joinCommunity}</span>
          </a>
        </nav>

        {/* Right side Auth & Actions */}
        <div className="hidden md:flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher variant="globe" />

          {/* Subtle divider */}
          <div className="h-5 w-px bg-stone-200" />

          {/* Saved Listings */}
          <Link
            id="nav-btn-favorites"
            href={currentUser ? '/dashboard/rentee' : '/listings'}
            className="relative p-2 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50/70 border border-stone-200/80 hover:border-rose-200 transition-all shadow-2xs"
            title="Saved Listings"
          >
            <Heart className="w-4 h-4" />
            {effectiveFavoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {effectiveFavoritesCount}
              </span>
            )}
          </Link>

          {currentUser ? (
            /* Authenticated User Menu */
            <div className="relative" ref={userMenuRef}>
              <button
                id="nav-user-profile-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 py-1.5 pl-2 pr-3.5 rounded-full border border-stone-200 hover:border-stone-300 bg-white transition shadow-2xs cursor-pointer select-none"
              >
                <UserAvatar
                  name={currentUser.displayName || currentUser.fullName}
                  photoURL={currentUser.photoURL}
                  size="xs"
                  ring="ring-1 ring-orange-500/50"
                />
                <div className="text-left hidden xl:block">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.displayName || 'Kiray User'}
                  </span>
                  <span className="block text-[10px] font-bold text-orange-600 uppercase leading-tight">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div
                  id="nav-user-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-[11px] text-stone-500">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {currentUser.email}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full capitalize">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  {currentUser.role === 'landlord' && (
                    <Link
                      href="/dashboard/landlord"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition"
                    >
                      <Building className="w-4 h-4 text-orange-600" />
                      <span>Owner Dashboard</span>
                    </Link>
                  )}

                  {currentUser.role === 'rentee' && (
                    <Link
                      href="/dashboard/rentee"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition"
                    >
                      <UserCheck className="w-4 h-4 text-orange-600" />
                      <span>Rentee Hub &amp; Favorites</span>
                    </Link>
                  )}

                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition"
                    >
                      <ShieldAlert className="w-4 h-4 text-orange-600" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  {currentUser.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-orange-600" />
                      <span>{t.navbar.changePassword}</span>
                    </button>
                  )}

                  {onSwitchDemoRole && (
                    <>
                      <div className="border-t border-stone-100 my-1"></div>
                      <div className="px-4 py-1 text-[10px] font-bold text-stone-400 uppercase">
                        Switch Test Role
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSwitchDemoRole('rentee');
                        }}
                        className="w-full px-4 py-1.5 text-left text-[11px] text-stone-600 hover:bg-stone-50 cursor-pointer"
                      >
                        Rentee View
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSwitchDemoRole('landlord');
                        }}
                        className="w-full px-4 py-1.5 text-left text-[11px] text-stone-600 hover:bg-stone-50 cursor-pointer"
                      >
                        Landlord View
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onSwitchDemoRole('admin');
                        }}
                        className="w-full px-4 py-1.5 text-left text-[11px] text-stone-600 hover:bg-stone-50 cursor-pointer"
                      >
                        Admin Console
                      </button>
                    </>
                  )}

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      id="nav-logout-btn"
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.common.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated Login / Register CTAs */
            <div className="flex items-center gap-2">
              {onOpenAuth ? (
                <>
                  <button
                    id="nav-login-btn"
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-stone-100/70 rounded-full transition cursor-pointer select-none"
                  >
                    {t.common.signIn}
                  </button>
                  <button
                    id="nav-register-btn"
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-full shadow-xs hover:shadow-orange-500/20 transition cursor-pointer select-none"
                  >
                    {t.common.signUp}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    id="nav-login-btn"
                    href="/login"
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-stone-100/70 rounded-full transition select-none"
                  >
                    {t.common.signIn}
                  </Link>
                  <Link
                    id="nav-register-btn"
                    href="/register"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-full shadow-xs hover:shadow-orange-500/20 transition select-none"
                  >
                    {t.common.signUp}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            id="mobile-fav-btn"
            href={currentUser ? '/dashboard/rentee' : '/listings'}
            className="p-2 text-slate-600 relative rounded-full hover:bg-stone-100"
            title="Saved Listings"
          >
            <Heart className="w-5 h-5" />
            {effectiveFavoritesCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {effectiveFavoritesCount}
              </span>
            )}
          </Link>
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 rounded-xl hover:bg-stone-100 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden border-t border-stone-200 bg-white px-5 pt-4 pb-6 space-y-3 shadow-xl text-sm font-semibold">
          {/* Mobile Language Switcher Row */}
          <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">{t.common.language}</span>
            <LanguageSwitcher variant="globe" />
          </div>

          <Link
            id="mobile-nav-link-home"
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-orange-600"
          >
            {t.common.home}
          </Link>
          <Link
            id="mobile-nav-link-browse"
            href="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-orange-600"
          >
            {t.common.browseProperties}
          </Link>

          <Link
            id="mobile-nav-link-how-it-works"
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-orange-600"
          >
            {t.common.howItWorks}
          </Link>

          <Link
            id="mobile-nav-link-safety-tips"
            href="/#safety-tips"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 hover:text-orange-600"
          >
            {t.common.safetyTips}
          </Link>

          <a
            id="mobile-nav-link-community"
            href="https://t.me/+0rRmPUoe0TgxYTQ0"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sky-700 hover:text-sky-800 font-semibold"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span>{t.navbar.joinCommunity}</span>
          </a>

          {currentUser?.role === 'landlord' && (
            <Link
              href="/dashboard/landlord"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-orange-600"
            >
              {t.navbar.ownerDashboard}
            </Link>
          )}

          {currentUser?.role === 'rentee' && (
            <Link
              href="/dashboard/rentee"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-orange-600"
            >
              {t.navbar.renteeHub}
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-orange-600"
            >
              {t.navbar.adminConsole}
            </Link>
          )}

          {currentUser && currentUser.role !== 'admin' && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsChangePasswordOpen(true);
              }}
              className="w-full text-left py-2 text-slate-800 hover:text-orange-600 font-semibold flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-orange-600" />
              <span>{t.navbar.changePassword}</span>
            </button>
          )}

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 text-center font-bold text-rose-600 bg-rose-50 rounded-xl cursor-pointer"
              >
                {t.common.logout} ({currentUser.displayName || currentUser.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-semibold text-slate-800 border border-stone-300 rounded-xl"
                >
                  {t.common.signIn}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center font-bold text-white bg-orange-600 rounded-xl"
                >
                  {t.common.signUp}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};
