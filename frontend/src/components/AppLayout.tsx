import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { UserRole } from '../backend';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isFarmer = userProfile?.role === UserRole.farmer;
  const isBuyer = userProfile?.role === UserRole.buyer;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => {
    return routerState.location.pathname === path;
  };

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/assets/generated/farm-market-logo.dim_512x512.png" alt="FarmDirect" className="h-10 w-10" />
              <span className="font-bold text-xl text-foreground">FarmDirect</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/marketplace">Marketplace</NavLink>
              {isAuthenticated && !profileLoading && userProfile && (
                <>
                  {isFarmer && (
                    <>
                      <NavLink to="/my-listings">My Listings</NavLink>
                      <NavLink to="/sales">Sales</NavLink>
                    </>
                  )}
                  {isBuyer && <NavLink to="/purchases">Purchases</NavLink>}
                  <NavLink to="/profile">Profile</NavLink>
                </>
              )}
            </nav>

            {/* Auth Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAuth}
                disabled={loginStatus === 'logging-in'}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="hidden md:inline-flex"
              >
                {loginStatus === 'logging-in' ? 'Signing in...' : isAuthenticated ? 'Sign Out' : 'Sign In'}
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-2">
                <NavLink to="/marketplace">Marketplace</NavLink>
                {isAuthenticated && !profileLoading && userProfile && (
                  <>
                    {isFarmer && (
                      <>
                        <NavLink to="/my-listings">My Listings</NavLink>
                        <NavLink to="/sales">Sales</NavLink>
                      </>
                    )}
                    {isBuyer && <NavLink to="/purchases">Purchases</NavLink>}
                    <NavLink to="/profile">Profile</NavLink>
                  </>
                )}
                <Button
                  onClick={handleAuth}
                  disabled={loginStatus === 'logging-in'}
                  variant={isAuthenticated ? 'outline' : 'default'}
                  size="sm"
                  className="mt-2"
                >
                  {loginStatus === 'logging-in' ? 'Signing in...' : isAuthenticated ? 'Sign Out' : 'Sign In'}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              © 2026. Built with <Sprout className="h-4 w-4 text-primary" /> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </div>
            <div className="text-center md:text-right">
              <p>Connecting farmers directly to buyers</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
