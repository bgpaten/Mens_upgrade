import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { session, hasProfile, loading, error } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', { 
    path: location.pathname, 
    session: !!session, 
    hasProfile, 
    loading, 
    requireOnboarding 
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg p-6 text-center">
        <div className="glass-card p-8 max-w-sm space-y-6">
          <div className="p-4 bg-rose-400/10 rounded-full w-fit mx-auto">
            <WifiOff className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Connection Refused</h2>
            <p className="text-white/40 text-xs leading-relaxed">{error}</p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retry Connection
            </button>
            <p className="text-[10px] text-white/20">Check if your ISP blocks Supabase URL.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/5 border-t-white/40 rounded-full animate-spin"></div>
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-white/40 text-sm font-medium tracking-tight">Men's Upgrade OS</p>
            <p className="text-white/10 text-[10px] uppercase font-bold tracking-[0.2em]">Synchronizing Session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    if (location.pathname === '/login') return <>{children}</>;
    console.log('No session, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname === '/login' && session) {
    console.log('Has session at /login, redirecting to /');
    return <Navigate to="/" replace />;
  }

  if (hasProfile === false && location.pathname !== '/onboarding' && requireOnboarding) {
    console.log('No profile, redirecting to /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  if (hasProfile === true && location.pathname === '/onboarding') {
    console.log('Has profile at /onboarding, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('Rendering children');
  return <>{children}</>;
}
