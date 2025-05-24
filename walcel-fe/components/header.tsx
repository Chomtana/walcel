'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/stats', label: 'Stats' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full py-3 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        {/* 🧭 Logo / Brand */}
        <div className="text-xl font-bold text-white">dWeb</div>

        {/* 📱 Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-muted-foreground hover:text-white">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 🧭 Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                isActive(item.href)
                  ? 'text-white font-semibold'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 🔗 Wallet Connect */}
        <div className="hidden md:flex items-center space-x-2">
          <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" label="Connect" />
        </div>
      </div>

      {/* 📱 Mobile Nav Links */}
      {menuOpen && (
        <div className="md:hidden px-6 pt-4 pb-3 space-y-3 bg-background text-muted-foreground border-t border-border">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block transition-colors ${
                isActive(item.href)
                  ? 'text-white font-semibold'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" label="Connect" />
          </div>
        </div>
      )}
    </header>
  );
}