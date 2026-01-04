import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target,
  FileText,
  BarChart3, 
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Today', path: '/' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: FileText, label: 'Report', path: '/report' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass lg:hidden flex items-center justify-around px-4 border-t border-white/10 z-50">
      {mobileNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
              isActive ? "text-white" : "text-white/40"
            )}
          >
            <item.icon className={cn(
              "w-6 h-6",
              isActive ? "scale-110" : ""
            )} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
