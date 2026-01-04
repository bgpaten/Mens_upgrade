import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Trophy, 
  Target, 
  Zap, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import { getUserGoals, getDailyLogs, getReports } from '@/lib/supabase-v11';
import { analyzePatterns } from '@/lib/analytics';
import type { AnalyticsResult } from '@/lib/analytics';
import { useAuth } from '@/components/AuthProvider';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user, days]);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const [goals, logs, reports] = await Promise.all([
        getUserGoals(user!.id),
        getDailyLogs(user!.id, startDate, endDate),
        getReports(user!.id, startDate, endDate)
      ]);

      const result = analyzePatterns(logs, reports, goals);
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-white/60">Menganalisis pola hidupmu...</p>
        </div>
      </div>
    );
  }

  if (!data || data.summary.avgScore === 0) {
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Analytics Belum Tersedia</h1>
        <p className="text-white/60 max-w-sm mx-auto">
          Kami butuh minimal beberapa hari data check-in untuk mulai mendeteksi pola dan memberikan rekomendasi.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-5xl mx-auto pb-24">
      {/* Header & Date Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2 text-primary">Meaningful Analytics</h1>
          <p className="text-white/60">Bukan sekadar chart, tapi insight untuk perbaikan diri.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          {[30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                days === d ? 'bg-primary text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {d} Hari
            </button>
          ))}
        </div>
      </div>

      {/* SECTION A: OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Avg Daily Score" 
          value={data.summary.avgScore.toString()} 
          suffix=""
          icon={<Activity className="text-blue-400" />}
          sub={data.summary.avgScore >= 80 ? "On Track" : "Need Improvement"}
        />
        <StatCard 
          label="Best Score" 
          value={data.summary.bestDay?.score.toString() || '0'} 
          icon={<Trophy className="text-yellow-400" />}
          sub={data.summary.bestDay?.date}
        />
        <StatCard 
          label="Hard Fails" 
          value={data.summary.hardFailCount.toString()} 
          icon={<AlertCircle className="text-red-500" />}
          sub="Total 30 hari terakhir"
        />
        <StatCard 
          label="Streak" 
          value={`${data.summary.noHardFailStreak}d`} 
          icon={<Zap className="text-orange-400" />}
          sub="No Hard-Fail Streak"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION D: FOCUS RECOMMENDATION (PLACED HIGHER FOR IMPACT) */}
        <div className="lg:col-span-1 border border-white/10 bg-white/5 rounded-3xl p-6 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 rounded-full"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Rekomendasi Besok
          </h2>
          
          <div className="space-y-6">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="space-y-2">
                <div className={`text-xs font-bold uppercase tracking-wider ${
                  rec.type === 'focus' ? 'text-green-400' :
                  rec.type === 'improve' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {rec.type === 'focus' ? '🔥 Fokuskan' :
                   rec.type === 'improve' ? '⚠️ Perbaiki' : '✂️ Abaikan Sementara'}
                </div>
                <div className="font-bold text-lg">{rec.habitTitle}</div>
                <div className="text-sm text-white/60 leading-relaxed italic">
                  "{rec.reason}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION B: PATTERN DETECTION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock size={20} className="text-blue-400" />
              Time-Based Pattern
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {data.patterns.map((p) => (
                <div key={p.dayName} className="flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-32 bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                    <div 
                      className={`w-full transition-all duration-1000 ${
                        p.avgScore >= 80 ? 'bg-primary' : 
                        p.avgScore >= 50 ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${p.avgScore}%` }}
                    ></div>
                    <span className="absolute bottom-2 text-[10px] font-bold text-black drop-shadow-sm">
                      {p.avgScore}
                    </span>
                  </div>
                  <span className="text-xs text-white/40 font-medium">{p.dayName}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Insight: {getPatternInsight(data.patterns)}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap size={20} className="text-orange-400" />
              Habit Impact Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold text-green-400 mb-2">SCORE BOOSTERS</div>
                {data.habitImpacts.topPositive.map((h) => (
                  <div key={h.goalId} className="flex items-center justify-between">
                    <span className="text-sm">{h.title}</span>
                    <span className="text-xs font-bold bg-green-500 text-black px-2 py-0.5 rounded-full">
                      +{h.impactScore}% impact
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold text-red-400 mb-2">SCORE KILLERS (MISSING)</div>
                {data.habitImpacts.topNegative.map((h) => (
                  <div key={h.goalId} className="flex items-center justify-between">
                    <span className="text-sm">{h.title}</span>
                    <span className="text-xs font-bold bg-red-500 text-black px-2 py-0.5 rounded-full">
                      -{h.impactScore}% impact
                    </span>
                  </div>
                ))}
                {data.habitImpacts.topNegative.length === 0 && (
                   <div className="text-xs text-white/40 italic">Data belum cukup untuk menganalisis score killers.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: FAILURE ANALYSIS */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <XCircle size={20} className="text-red-500" />
          Akar Masalah (Root Cause Analysis)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-white/40 uppercase">Top Failed Goals</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/40 uppercase text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.failures.topFailedGoals.map((g, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm">{g.title}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-red-400">{g.count}x</td>
                  </tr>
                ))}
                {data.failures.topFailedGoals.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-white/40 italic">Belum ada data kegagalan terdeteksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-bold text-white/60">Penyebab Kegagalan Utama:</div>
            <div className="space-y-3">
              {data.failures.topRootCauses.map((rc, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 bg-white/5 rounded-full h-8 relative overflow-hidden border border-white/10">
                    <div 
                      className="absolute left-0 top-0 h-full bg-red-500/30"
                      style={{ width: `${(rc.count / (data.summary.hardFailCount || 1)) * 100}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center px-4 text-sm font-medium">
                      {rc.cause}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-white/60">{rc.count} logs</div>
                </div>
              ))}
              {data.failures.topRootCauses.length === 0 && (
                <div className="text-white/40 italic text-sm">Belum ada root cause terlampir di Daily Reports.</div>
              )}
            </div>
            <p className="text-xs text-white/40 leading-relaxed bg-white/5 p-3 rounded-lg border border-dashed border-white/10">
              💡 Tip: Selalu isi kolom 'Root Cause' saat harimu gagal agar engine bisa memberikan insight yang akurat.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, icon, sub, suffix = "" }: { label: string; value: string; icon: React.ReactNode; sub?: string; suffix?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2 hover:bg-white/[0.07] transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold font-mono">
        {value}<span className="text-sm font-normal text-white/40 ml-1">{suffix}</span>
      </div>
      {sub && <div className="text-xs text-white/60">{sub}</div>}
    </div>
  );
}

function getPatternInsight(patterns: any[]) {
    const validPatterns = patterns.filter(p => p.frequency > 0);
    if (validPatterns.length === 0) return "Selesaikan check-in satu minggu penuh untuk melacak performa tiap hari.";
    
    const sorted = [...validPatterns].sort((a, b) => b.avgScore - a.avgScore);
    const bestDay = sorted[0];
    const worstDay = sorted[sorted.length - 1];

    if (bestDay.dayName === worstDay.dayName) return "Data belum cukup untuk mendeteksi variasi hari.";
    
    return `Harimu paling optimal di hari ${bestDay.dayName} (avg ${bestDay.avgScore}) dan cenderung menurun di hari ${worstDay.dayName} (avg ${worstDay.avgScore}).`;
}
