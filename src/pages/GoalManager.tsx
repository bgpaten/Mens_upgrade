import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getUserGoals, saveGoal, deleteGoal } from '@/lib/supabase-v11';
import type { GoalItem, TaskCategory, TaskPeriod, TargetType } from '@/lib/types';
import { Plus, Trash2, Save } from 'lucide-react';

const CATEGORIES: TaskCategory[] = ['Spiritual', 'Health', 'Appearance', 'Finance', 'Discipline', 'Emotion', 'Work/Build'];
const PERIODS: TaskPeriod[] = ['daily', 'weekly', 'monthly'];
const TARGET_TYPES: TargetType[] = ['boolean', 'numeric', 'scale', 'time', 'text'];

export default function GoalManager() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Partial<GoalItem>>({});

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id]);

  const loadGoals = async () => {
    if (!user?.id) return;
    const data = await getUserGoals(user.id);
    setGoals(data);
  };

  const handleSave = async () => {
    if (!user?.id || !currentGoal.title) return;

    const goalToSave: GoalItem = {
      id: currentGoal.id || crypto.randomUUID(),
      userId: user.id,
      title: currentGoal.title,
      description: currentGoal.description || '',
      category: (currentGoal.category as TaskCategory) || 'Discipline',
      period: (currentGoal.period as TaskPeriod) || 'daily',
      targetType: (currentGoal.targetType as TargetType) || 'boolean',
      targetValue: currentGoal.targetValue || 0,
      isHardFail: currentGoal.isHardFail || false,
      active: true,
      createdAt: currentGoal.createdAt || new Date().toISOString(),
      ...currentGoal
    };

    await saveGoal(user.id, goalToSave);
    await loadGoals();
    setIsEditing(false);
    setCurrentGoal({});
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (confirm('Delete this goal permanently?')) {
        await deleteGoal(user.id, id);
        await loadGoals();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          Goals & Habits
        </h1>
        <button 
          onClick={() => { setCurrentGoal({}); setIsEditing(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {isEditing && (
        <div className="glass-card p-6 space-y-4 border border-blue-500/30 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-white/50">Title</label>
              <input 
                value={currentGoal.title || ''}
                onChange={e => setCurrentGoal({...currentGoal, title: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-blue-500 outline-none"
                placeholder="e.g., Morning Run"
              />
            </div>
            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-white/50">Category</label>
                <select 
                    value={currentGoal.category || 'Discipline'}
                    onChange={e => setCurrentGoal({...currentGoal, category: e.target.value as TaskCategory})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-white/50">Frequency</label>
                <select 
                    value={currentGoal.period || 'daily'}
                    onChange={e => setCurrentGoal({
                        ...currentGoal, 
                        period: e.target.value as TaskPeriod,
                        frequency: e.target.value as any
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                >
                    {PERIODS.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                </select>
            </div>
            {currentGoal.period === 'weekly' && (
              <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-white/50">Review Day</label>
                  <select 
                      value={currentGoal.scheduleConfig?.weeklyReviewDay ?? 0}
                      onChange={e => setCurrentGoal({
                          ...currentGoal, 
                          scheduleConfig: {
                              ...currentGoal.scheduleConfig,
                              weeklyReviewDay: parseInt(e.target.value)
                          }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                  >
                      <option value="0" className="bg-slate-900">Sunday (Default)</option>
                      <option value="1" className="bg-slate-900">Monday</option>
                      <option value="2" className="bg-slate-900">Tuesday</option>
                      <option value="3" className="bg-slate-900">Wednesday</option>
                      <option value="4" className="bg-slate-900">Thursday</option>
                      <option value="5" className="bg-slate-900">Friday</option>
                      <option value="6" className="bg-slate-900">Saturday</option>
                  </select>
              </div>
            )}
            {currentGoal.period === 'monthly' && (
              <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-white/50">Window Start (Date)</label>
                  <input 
                      type="number"
                      min="1"
                      max="31"
                      value={currentGoal.scheduleConfig?.monthlyWindowStart ?? 25}
                      onChange={e => setCurrentGoal({
                          ...currentGoal, 
                          scheduleConfig: {
                              ...currentGoal.scheduleConfig,
                              monthlyWindowStart: parseInt(e.target.value)
                          }
                      })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                  />
                  <p className="text-[10px] text-white/30 italic">Target review starts from this date until end of month.</p>
              </div>
            )}
            <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-white/50">Input Type</label>
                <select 
                    value={currentGoal.targetType || 'boolean'}
                    onChange={e => setCurrentGoal({...currentGoal, targetType: e.target.value as TargetType})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none"
                >
                    {TARGET_TYPES.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
            </div>
             <div className="flex items-center gap-3 pt-6">
                <input 
                    type="checkbox"
                    checked={currentGoal.isHardFail || false}
                    onChange={e => setCurrentGoal({...currentGoal, isHardFail: e.target.checked})}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500"
                />
                <label className="text-sm font-medium text-red-300">Hard Fail Rule?</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium flex items-center gap-2"
            >
                <Save size={16} /> Save Goal
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="glass-card p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`w-2 h-12 rounded-full ${goal.isHardFail ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <div>
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs uppercase tracking-wider">{goal.category}</span>
                        <span>•</span>
                        <span className="capitalize">{goal.period}</span>
                        <span>•</span>
                        <span className="capitalize">{goal.targetType}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => { setCurrentGoal(goal); setIsEditing(true); }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    Edit
                </button>
                <button 
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
        
        {goals.length === 0 && !isEditing && (
            <div className="text-center py-12 text-white/30 italic">
                No goals set. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
