import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getUserGoals, saveDailyLog, getDailyLog } from '@/lib/supabase-v11';
import { isGoalDue, generateDailyReport } from '@/lib/reporting';
import type { GoalItem, DailyLogV2, DailyEntry } from '@/lib/types';
import { format } from 'date-fns';
import { Check, AlertTriangle, Save, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [activeGoals, setActiveGoals] = useState<GoalItem[]>([]);
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [logId, setLogId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    
    try {
        // 1. Get Goals
        const allGoals = await getUserGoals(user.id);
        
        // 2. Filter for Today
        const todays = allGoals.filter(g => isGoalDue(g, today));
        setActiveGoals(todays);
        
        // 3. Get existing log
        const log = await getDailyLog(user.id, today);
        if (log) {
            setEntries(log.entries);
            setFailReason(log.failReason || '');
            setLogId(log.id);
        } else {
            // Initialize empty entries
            const initEntries: Record<string, DailyEntry> = {};
            todays.forEach(g => {
                initEntries[g.id] = {
                    id: g.id,
                    goalId: g.id,
                    value: g.targetType === 'boolean' ? false : '',
                    isComplete: false
                };
            });
            setEntries(initEntries);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const updateEntry = (goalId: string, val: any, isComplete: boolean) => {
    setEntries(prev => ({
        ...prev,
        [goalId]: {
            ...prev[goalId],
            value: val,
            isComplete
        }
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    
    try {
        // 1. Calculate basic score (pre-validation)
        const total = activeGoals.length;
        const completed = Object.values(entries).filter(e => e.isComplete).length;
        const rawScore = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // 2. Check Hard Fail
        let breached = false;
        activeGoals.forEach(g => {
            if (g.isHardFail && entries[g.id]?.value === true) {
                breached = true;
            }
        });
        
        // 3. Extract mood and notes from goal entries (if they exist as goals)
        const moodGoal = activeGoals.find(g => g.title.toLowerCase().includes('mood'));
        const notesGoal = activeGoals.find(g => g.title.toLowerCase().includes('trigger') || g.title.toLowerCase().includes('catatan'));
        
        const extractedMood = moodGoal ? entries[moodGoal.id]?.value : undefined;
        const extractedNotes = notesGoal ? entries[notesGoal.id]?.value : '';
        
        const log: DailyLogV2 = {
            id: today,
            userId: user.id,
            date: today,
            entries,
            score: breached ? 0 : rawScore,
            breachedHardFail: breached,
            failReason: breached ? failReason : undefined,
            moodRating: typeof extractedMood === 'number' ? extractedMood : undefined,
            notes: typeof extractedNotes === 'string' ? extractedNotes : '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await saveDailyLog(user.id, log);
        await generateDailyReport(user.id, today);
        
        // Navigate to report
        navigate('/report');
        
    } catch (e) {
        console.error(e);
        alert("Failed to submit day");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-white/30" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 pb-24">
      <header className="space-y-2">
        <div className="flex items-center space-x-2 text-white/40 mb-1">
            <Calendar size={14} />
            <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(), 'EEEE, dd MMMM yyyy')}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Today's Mission</h1>
        <p className="text-white/50">Complete your active protocols. Consistency is key.</p>
      </header>

      {/* HARD FAIL SECTION */}
      {activeGoals.some(g => g.isHardFail) && (
          <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <AlertTriangle size={14} /> Warning Zone
              </h2>
              <div className="grid gap-3">
                  {activeGoals.filter(g => g.isHardFail).map(goal => (
                      <div key={goal.id} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                          <div>
                              <p className="font-bold text-red-200">{goal.title}</p>
                              {goal.description && <p className="text-xs text-red-200/50">{goal.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg">
                              <button 
                                onClick={() => updateEntry(goal.id, false, true)} // False means "I didn't do it" -> which is GOOD for a negative habit
                                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${entries[goal.id]?.value === false ? 'bg-emerald-500 text-white' : 'text-white/30 hover:bg-white/5'}`}
                              >
                                NO
                              </button>
                              <button 
                                onClick={() => updateEntry(goal.id, true, false)} // True means "I DID it" -> BAD
                                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${entries[goal.id]?.value === true ? 'bg-red-500 text-white' : 'text-white/30 hover:bg-white/5'}`}
                              >
                                YES
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}

      {/* CHECKLIST SECTION */}
      <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Daily Protocols</h2>
          <div className="grid gap-3">
              {activeGoals.filter(g => !g.isHardFail).map(goal => (
                  <div key={goal.id} className="glass-card p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                      <div className="flex-1">
                          <p className="font-bold text-lg">{goal.title}</p>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                              <span className="bg-white/5 px-2 py-0.5 rounded uppercase">{goal.category}</span>
                              {goal.targetValue && <span>Target: {goal.targetValue} {goal.targetType === 'time' ? 'mins' : ''}</span>}
                          </div>
                      </div>

                      {/* INPUTS BASED ON TYPE */}
                      <div className="flex items-center gap-4">
                          {goal.targetType === 'boolean' && (
                              <button 
                                onClick={() => {
                                    const newVal = !entries[goal.id]?.value;
                                    updateEntry(goal.id, newVal, newVal); // If true, complete
                                }}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${entries[goal.id]?.value ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                              >
                                  <Check size={24} />
                              </button>
                          )}
                          
                          {(goal.targetType === 'numeric' || goal.targetType === 'time') && (
                              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                  <input 
                                      type="number" 
                                      className="w-20 bg-transparent text-center font-bold outline-none"
                                      placeholder="0"
                                      value={entries[goal.id]?.value || ''}
                                      onChange={(e) => {
                                          const val = parseFloat(e.target.value);
                                          const target = goal.targetValue || 0;
                                          updateEntry(goal.id, val, val >= target);
                                      }}
                                  />
                                  <div className={`p-2 rounded-md transition-colors ${entries[goal.id]?.isComplete ? 'text-emerald-400' : 'text-white/20'}`}>
                                    <Check size={18} />
                                  </div>
                              </div>
                          )}

                           {goal.targetType === 'scale' && (
                              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                  {[1,2,3,4,5].map(rating => (
                                      <button
                                          key={rating}
                                          onClick={() => updateEntry(goal.id, rating, true)}
                                          className={`px-3 py-2 rounded-md font-bold transition-all ${entries[goal.id]?.value === rating ? 'bg-blue-500 text-white' : 'text-white/30 hover:bg-white/10'}`}
                                      >
                                          {rating}
                                      </button>
                                  ))}
                              </div>
                          )}
                          
                          {goal.targetType === 'text' && (
                              <textarea
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:ring-2 ring-blue-500/50 resize-none min-h-[80px]"
                                  placeholder={goal.description || "Tulis di sini..."}
                                  value={entries[goal.id]?.value || ''}
                                  onChange={(e) => {
                                      const val = e.target.value;
                                      updateEntry(goal.id, val, val.length > 0);
                                  }}
                              />
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* FAIL REASON IF NEEDED */}
      {Object.values(entries).some(e => 
          activeGoals.find(g => g.id === e.goalId)?.isHardFail && e.value === true
      ) && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
              <label className="text-red-400 font-bold block mb-2">Why did this happen? (Root Cause)</label>
              <select 
                  className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-200 outline-none focus:ring-2 ring-red-500/50"
                  value={failReason}
                  onChange={e => setFailReason(e.target.value)}
              >
                  <option value="">Select a reason...</option>
                  <option value="distraction">Distraction / Social Media</option>
                  <option value="stress">Stress / Emotional Trigger</option>
                  <option value="fatigue">Fatigue / Low Energy</option>
                  <option value="planning">Poor Planning</option>
                  <option value="impulse">Impulse Control</option>
              </select>
          </div>
      )}

      {/* SUBMIT BUTTON */}
      <button 
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 flex items-center justify-center gap-2 transition-all"
      >
        {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
        {logId ? 'Update Log' : 'Submit Day'}
      </button>

      {activeGoals.length === 0 && !loading && (
          <div className="text-center py-12 text-white/30">
              <p>No goals scheduled for today.</p>
              <button onClick={() => navigate('/goals')} className="text-blue-400 hover:underline mt-2">Manage Goals</button>
          </div>
      )}
    </div>
  );
}
