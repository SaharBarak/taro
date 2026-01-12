'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';
import styles from './Header.module.css';

const navLinks = [
  { href: '/', label: 'בית' },
  { href: '/about', label: 'אודות' },
  { href: '/votes', label: 'הצבעות' },
  { href: '/download', label: 'הורדה' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, signOut, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // User avatar or initials
  const userInitials = user
    ? (user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()
    : '?';

  return (
    <motion.header
      className={clsx(styles.header, isScrolled && styles.scrolled)}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>תֵּרָאוּ</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className={styles.actions}>
          {!isLoading && (
            <>
              {!isAuthenticated ? (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      התחברות
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="primary" size="sm">
                      הרשמה
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      לוח בקרה
                    </Button>
                  </Link>
                  <div className={styles.userMenu}>
                    <button className={styles.avatarButton}>
                      <span className={styles.avatar}>{userInitials}</span>
                    </button>
                    <div className={styles.userDropdown}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {user?.firstName || 'משתמש'}
                        </span>
                        <span className={styles.userEmail}>{user?.email}</span>
                      </div>
                      <hr className={styles.divider} />
                      <Link href="/profile" className={styles.dropdownItem}>
                        פרופיל
                      </Link>
                      <Link href="/settings" className={styles.dropdownItem}>
                        הגדרות
                      </Link>
                      <hr className={styles.divider} />
                      <button
                        className={styles.dropdownItem}
                        onClick={() => signOut()}
                      >
                        התנתקות
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
          >
            <span
              className={clsx(styles.hamburger, isMobileMenuOpen && styles.open)}
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileNav}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className={styles.mobileNavContent}>
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className={styles.mobileAuthButtons}>
                {!isAuthenticated ? (
                  <>
                    <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" isFullWidth>
                        התחברות
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="primary" isFullWidth>
                        הרשמה
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" isFullWidth>
                        לוח בקרה
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      isFullWidth
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                    >
                      התנתקות
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
