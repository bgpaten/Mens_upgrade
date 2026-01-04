import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getScoreColor } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DomainCardProps {
  title: string;
  score: number;
  trend: { value: number }[];
  icon: React.ElementType;
  onClick?: () => void;
}

export function DomainCard({ title, score, trend, icon: Icon, onClick }: DomainCardProps) {
  const colorClass = getScoreColor(score);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="glass-card p-6 flex flex-col justify-between cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        <div className="h-10 w-20 min-w-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="currentColor" 
                strokeWidth={2} 
                dot={false} 
                className={colorClass}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white/50">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight">{score}</span>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">/ 100</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
        <span>View Details</span>
        <span>→</span>
      </div>
    </motion.div>
  );
}
