'use client';

import React, { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { brand } from '@/config/brand';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, X, User, Store, FolderTree, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useCartStore } from '@/features/cart/store';
import { useAuthStore } from '@/features/auth/store';
import { getUserHome, logout as logoutRequest } from '@/features/auth/api/auth.api';
import { removeAuthCookie } from '@/features/auth/actions';
import { MegaMenu } from './MegaMenu';
import { CategorySearchSelect } from './CategorySearchSelect';
import { MobileMenu } from './MobileMenu';
import { SellEarnCtas } from './SellEarnCtas';
import { PointsChip } from '@/features/rewards/components/PointsChip';
import { searchStorefront, StorefrontSearchResult } from '@/features/shop/api';
import { SearchResultGroup } from './SearchResultGroup';

export function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StorefrontSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get cart item count from store
  const totalItems = useCartStore(state => state.getTotalItems());
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const isLoggedIn = mounted && isAuthenticated;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);

      if (isScrolled) {
        setIsVisible(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsVisible(false);
        }, 2500); // Hide after 2.5 seconds of scroll inactivity
      } else {
        setIsVisible(true);
        clearTimeout(timeout);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const shouldShow = !scrolled || isVisible || isHovered;

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Merchants', href: '/merchants' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const accountHref = user ? getUserHome(user) : '/auth/login';

  const handleSignOut = async () => {
    try {
      await logoutRequest();
    } finally {
      await removeAuthCookie();
      logout();
      router.push('/');
    }
  };

  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    if (normalizedQuery.length < 2) return;

    let isCurrentRequest = true;
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStorefront(normalizedQuery);
        if (isCurrentRequest) setSearchResults(results);
      } catch {
        if (isCurrentRequest) setSearchResults(null);
      } finally {
        if (isCurrentRequest) setIsSearching(false);
      }
    }, 250);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
    }
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) return;
    closeSearch();
    router.push(`/shop?search=${encodeURIComponent(normalizedQuery)}`);
  };

  const hasSearchResults = Boolean(
    searchResults &&
      (searchResults.products.length || searchResults.merchants.length || searchResults.categories.length || searchResults.brands.length),
  );

  return (
    <>
      <header
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 right-0 z-50 flex flex-col items-center px-2 w-full transition-all duration-500 ${scrolled ? 'top-0' : 'top-2'} ${!shouldShow ? 'lg:-translate-y-full lg:opacity-0' : 'translate-y-0 opacity-100'}`}
      >
        {/* Utility Strip */}
        <div className="w-full max-w-7xl bg-brand-50 border border-brand-100 rounded-t-xl md:rounded-t-2xl p-2 flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Block 1: Search */}
          <form onSubmit={submitSearch} className="relative w-full md:w-auto flex flex-1 max-w-md">
            <CategorySearchSelect />
            <input
              type="text"
              placeholder="Search for anything"
              value={searchQuery}
              onChange={(event) => handleSearchQueryChange(event.target.value)}
              onBlur={() => window.setTimeout(() => setSearchResults(null), 150)}
              className="w-full h-9 pl-[120px] pr-10 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted/70"
            />
            {isSearching ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-text-muted" /> : <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />}
            {(hasSearchResults || (searchQuery.trim().length >= 2 && !isSearching && searchResults)) && (
              <div className="absolute left-0 right-0 top-11 z-[60] max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-white p-2 shadow-xl">
                {searchResults?.products.length ? <SearchResultGroup title="Products">{searchResults.products.map((product) => <Link key={`product-${product.id}`} href={`/products/${product.slug}`} onClick={closeSearch} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-1"><span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{product.name}</span><span className="text-xs text-text-muted">Product</span></Link>)}</SearchResultGroup> : null}
                {searchResults?.merchants.length ? <SearchResultGroup title="Merchants">{searchResults.merchants.map((merchant) => <Link key={`merchant-${merchant.id}`} href={`/merchants/${merchant.id}`} onClick={closeSearch} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-1"><Store className="h-4 w-4 text-brand-600" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{merchant.businessName}</span><span className="text-xs text-text-muted">Merchant</span></Link>)}</SearchResultGroup> : null}
                {searchResults?.categories.length ? <SearchResultGroup title="Categories">{searchResults.categories.map((category) => <Link key={`${category.type}-${category.id}`} href={`/shop?search=${encodeURIComponent(category.name)}`} onClick={closeSearch} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-1"><FolderTree className="h-4 w-4 text-brand-600" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{category.name}</span><span className="text-xs text-text-muted">{category.type}</span></Link>)}</SearchResultGroup> : null}
                {searchResults?.brands.length ? <SearchResultGroup title="Brands">{searchResults.brands.map((brandResult) => <Link key={`brand-${brandResult.id}`} href={`/shop?search=${encodeURIComponent(brandResult.name)}`} onClick={closeSearch} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-1"><Tag className="h-4 w-4 text-brand-600" /><span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{brandResult.name}</span><span className="text-xs text-text-muted">Brand</span></Link>)}</SearchResultGroup> : null}
                {!hasSearchResults ? <p className="px-3 py-4 text-center text-sm text-text-muted">No results found for &quot;{searchQuery.trim()}&quot;.</p> : null}
              </div>
            )}
          </form>

          {/* Block 2: Sell & Earn */}
          <SellEarnCtas />
        </div>

        {/* Main Header */}
        <div className="bg-white/95 max-w-7xl backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border/50 p-2 flex items-center justify-between w-full transition-all rounded-b-xl md:rounded-b-2xl">

          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-8 pl-4 lg:pl-6">
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src={brand.logo.full}
                alt={brand.name}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-[13px] font-bold tracking-[0.08em] uppercase transition-colors ${pathname === link.href ? 'text-brand-700 bg-brand-50' : 'text-text-muted hover:text-brand-600 hover:bg-surface-1'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2">
            {/* Search, Cart, Account (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">

              <Link href="/cart" className="relative p-3 text-text-muted hover:text-brand-600 transition-colors bg-surface-1 hover:bg-brand-50 rounded-full">
                <ShoppingCart className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand-600 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            <div className="hidden md:block h-6 w-px bg-border mx-1"></div>

            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2 pr-4 border-r border-border mr-2">
                <PointsChip />
              </div>
            ) : null}

            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-1">
              <Link href={accountHref} className="flex items-center gap-2 p-1.5 pr-4 border border-border hover:border-brand-500 transition-colors hover:shadow-sm">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                  {user?.name?.[0] || 'J'}{user?.name?.[1] || 'D'}
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-wide">{user?.name || 'User'}</span>
              </Link>
              <button onClick={handleSignOut} className="px-3 text-xs font-bold uppercase tracking-wide text-text-muted hover:text-error">
                Log out
              </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 pl-2">
                <Link href="/auth/login" className="px-3 text-[13px] font-bold text-text-muted hover:text-brand-600 uppercase tracking-wide">
                  Log in
                </Link>
                <Link href="/auth/register">
                  <Button className="h-11 px-6 text-white shadow-md font-bold uppercase tracking-wide text-[13px] flex items-center gap-2">
                    <User className="w-4 h-4" /> Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden pl-2">
              <Link href="/cart" className="relative p-2 text-text-muted bg-surface-1 rounded-full md:hidden">
                <ShoppingCart className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand-600 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={toggleMobileMenu} className="text-text p-3 bg-surface-2 hover:bg-surface-3 rounded-full transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className={` max-w-7xl hidden lg:block transition-all duration-500 ${scrolled ? '  pointer-events-none' : '  '}`}>
          <MegaMenu />
        </div>

      </header>


      {/* Mobile Navigation Menu */}
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navLinks={navLinks}
        />
      )}
    </>
  );
}
