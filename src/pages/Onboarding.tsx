import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { seedDefaultGoals } from '@/lib/seed_data';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Seed default goals
        await seedDefaultGoals(user.id);
      }
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <div className="w-full max-w-md space-y-8 glass-card p-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Welcome to Goal Tracker</h2>
          <p className="mt-2 text-center text-sm text-white/60">
            Let's set up your daily tracking system
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-bold mb-2">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>✅ 7 default goals (Subuh, Deep Work, Workout, etc.)</li>
              <li>📊 Daily check-in system with hard fail rules</li>
              <li>📈 Automated daily reports with insights</li>
              <li>🎯 Customizable goals and frequencies</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-white/90 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
