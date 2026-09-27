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
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentUser, logout } from '@/features/auth/authSlice';
import { logoutFirebase } from '@/features/auth/firebase';
import { useFavorites } from '@/features/favorites';
import { baseApi } from '@/store/baseApi';
import { useTranslation } from '@/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="focus:outline-none">
          <Logo showMotto={true} size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link
            id="nav-link-home"
            href="/"
            className={`transition hover:text-orange-600 ${
              isActive('/') ? 'text-orange-600 font-bold' : ''
            }`}
          >
            {t.common.home}
          </Link>

          <Link
            id="nav-link-browse"
            href="/listings"
            className={`transition hover:text-orange-600 ${
              isActive('/listings') ? 'text-orange-600 font-bold' : ''
            }`}
          >
            {t.common.browseProperties}
          </Link>

          {/* Role-specific dashboard links */}
          {currentUser?.role === 'landlord' && (
            <Link
              id="nav-link-landlord-dash"
              href="/dashboard/landlord"
              className={`transition hover:text-orange-600 flex items-center gap-1.5 ${
                isActive('/dashboard/landlord') ? 'text-orange-600 font-bold' : ''
              }`}
            >
              <Building className="w-4 h-4 text-orange-600" />
              <span>{t.navbar.ownerDashboard}</span>
            </Link>
          )}

          {currentUser?.role === 'rentee' && (
            <Link
              id="nav-link-rentee-dash"
              href="/dashboard/rentee"
              className={`transition hover:text-orange-600 flex items-center gap-1.5 ${
                isActive('/dashboard/rentee') ? 'text-orange-600 font-bold' : ''
              }`}
            >
              <UserCheck className="w-4 h-4 text-orange-600" />
              <span>{t.navbar.renteeHub}</span>
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              id="nav-link-admin-dash"
              href="/admin"
              className={`transition hover:text-orange-600 flex items-center gap-1.5 ${
                isActive('/admin') ? 'text-orange-600 font-bold' : ''
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-orange-600" />
              <span>{t.navbar.adminConsole}</span>
            </Link>
          )}

          {/* Info anchors / modals */}
          {onOpenHowItWorks ? (
            <button
              id="nav-link-how-it-works"
              onClick={onOpenHowItWorks}
              className="transition hover:text-orange-600 text-stone-600 cursor-pointer"
            >
              {t.common.howItWorks}
            </button>
          ) : (
            <Link
              id="nav-link-how-it-works"
              href="/#how-it-works"
              className="transition hover:text-orange-600 text-stone-600"
            >
              {t.common.howItWorks}
            </Link>
          )}

          {onOpenSafetyTips ? (
            <button
              id="nav-link-safety-tips"
              onClick={onOpenSafetyTips}
              className="transition hover:text-orange-600 text-stone-600 cursor-pointer"
            >
              {t.common.safetyTips}
            </button>
          ) : (
            <Link
              id="nav-link-safety-tips"
              href="/#safety-tips"
              className="transition hover:text-orange-600 text-stone-600"
            >
              {t.common.safetyTips}
            </Link>
          )}
        </nav>

        {/* Right side Auth & Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="globe" />

          { currentUser? 
          <Link
            id="nav-btn-favorites"
            href="/dashboard/rentee"
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-stone-100 transition"
            title="Saved Listings"
          >
            <Heart className="w-5 h-5" />
            {effectiveFavoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {effectiveFavoritesCount}
              </span>
            )}
          </Link>: ("")}

          {currentUser ? (
            /* Authenticated User Menu */
            <div className="relative" ref={userMenuRef}>
              <button
                id="nav-user-profile-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 py-1.5 pl-2 pr-3 rounded-full border border-stone-200 hover:border-stone-300 bg-white transition shadow-2xs cursor-pointer"
              >
                <UserAvatar
                  name={currentUser.displayName || currentUser.fullName}
                  photoURL={currentUser.photoURL}
                  size="xs"
                  ring="ring-1 ring-orange-500/50"
                />
                <div className="text-left hidden lg:block">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.displayName || 'Kiray User'}
                  </span>
                  <span className="block text-[10px] font-bold text-orange-600 uppercase leading-tight">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
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
                    className="px-4 py-2 text-xs font-bold text-slate-800 hover:text-orange-600 bg-white hover:bg-stone-50 rounded-xl border border-stone-300 transition shadow-2xs cursor-pointer"
                  >
                    {t.common.signIn}
                  </button>
                  <button
                    id="nav-register-btn"
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {t.common.signUp}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    id="nav-login-btn"
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-800 hover:text-orange-600 bg-white hover:bg-stone-50 rounded-xl border border-stone-300 transition shadow-2xs"
                  >
                    {t.common.signIn}
                  </Link>
                  <Link
                    id="nav-register-btn"
                    href="/register"
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition"
                  >
                    {t.common.signUp}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            id="mobile-fav-btn"
            href="/dashboard/rentee"
            className="p-2 text-slate-600 relative"
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
            className="p-2 text-slate-700 rounded-lg hover:bg-stone-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="sm:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg text-sm font-semibold">
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
    </header>
  );
};
