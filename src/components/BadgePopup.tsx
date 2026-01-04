// Badge popup component for achievement notifications
import { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgePopupProps {
  badge: string;
  onClose: () => void;
}

export default function BadgePopup({ badge, onClose }: BadgePopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 glass-card p-6 border border-amber-400/30 max-w-sm transition-all duration-300',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-all"
      >
        <X size={16} className="text-white/40" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-400/10 rounded-xl">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Achievement Unlocked!</h3>
          <p className="text-white/60 text-sm">{badge}</p>
        </div>
      </div>

      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 animate-[shrink_5s_linear]"
          style={{
            animation: 'shrink 5s linear forwards'
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
