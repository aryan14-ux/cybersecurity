"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Target,
  Search,
  BookOpen,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/labs", label: "Labs", icon: Target },
  { href: "/scanner", label: "Scanner", icon: Search },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUser = session?.user || {
    name: "Admin",
    email: "admin@xsslab.com",
    role: "ADMIN",
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyber-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-neon-green" />
              <span className="text-xl font-bold gradient-text hidden sm:block">
                XSS Lab
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-neon-green/10 text-neon-green"
                        : "text-cyber-400 hover:text-white hover:bg-cyber-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname?.startsWith("/admin")
                      ? "bg-neon-purple/10 text-neon-purple"
                      : "text-cyber-400 hover:text-white hover:bg-cyber-800"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cyber-300 hover:text-white hover:bg-cyber-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-neon-green/20 border border-neon-green/30 flex items-center justify-center">
                    <span className="text-neon-green text-xs font-bold">
                      {currentUser.name?.[0]?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {currentUser.name || "Admin"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass rounded-lg border border-cyber-700 shadow-lg py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-cyber-300 hover:text-white hover:bg-cyber-800"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neon-red hover:bg-cyber-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg text-sm hover:bg-neon-green/20 transition-all"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden text-cyber-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-cyber-700/50 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-neon-green/10 text-neon-green"
                    : "text-cyber-400 hover:text-white hover:bg-cyber-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
