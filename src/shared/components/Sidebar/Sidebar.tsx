"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import styles from './Sidebar.module.css';
import { LayoutDashboard, FileText, Users, LogOut, ChevronRight, Shield } from 'lucide-react';
import Logo from '@/shared/assets/logo.png';

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user, userRole } = useAuth();
  
  if (!user) return null;

  // Declarative navigation array (Refactored for robustness)
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Funding Bids', path: '/bids', icon: FileText },
    { name: 'Contacts', path: '/contacts', icon: Users },
    ...(userRole === 'Admin' ? [{ name: 'Admin Management', path: '/admin', icon: Shield }] : [])
  ];

  // Logic to parse name for the profile card
  let displayName = 'Employee';
  let initial = 'U';
  if (user.displayName) {
    displayName = user.displayName.split(' ')[0];
    initial = displayName.charAt(0);
  } else if (user.email) {
    const firstPart = user.email.split('@')[0].split('.')[0];
    displayName = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    initial = displayName.charAt(0);
  }

  return (
    <aside className={`glass-panel ${styles.sidebar}`}>
      <div className={styles.brand}>
        <img src={Logo.src} alt="YMCA Logo" className={styles.companyLogo} />
        <div className={styles.brandName}>
          Funding Tracker
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => {
          const isActive = pathname === link.path;
          const Icon = link.icon;
          return (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
              {isActive && <ChevronRight size={14} className={styles.chevron} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>{initial}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{userRole} Access</span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={16} />
          Sign Out
        </button>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '8px', textAlign: 'center' }}>
          System Version: 2.0.5-ULTRA-SYNC
        </div>
      </div>
    </aside>
  );
};
