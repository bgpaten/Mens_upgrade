import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getDailyReport, getUserGoals, getDailyLog } from '@/lib/supabase-v11';
import { isGoalDue, generateDailyReport } from '@/lib/reporting';
import type { DailyReport } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, FileText, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateReportHTML, downloadHTMLReport, printReport } from '@/lib/reportTemplate';

export default function DailyReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadReport();
    }
  }, [user?.id]);

  const loadReport = async () => {
    if (!user?.id) return;
    try {
        const data = await getDailyReport(user.id, today);
        setReport(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!report || !user?.id) return;
    
    try {
      // Fetch additional data for template
      const allGoals = await getUserGoals(user.id);
      const log = await getDailyLog(user.id, today);
      
      if (!log) {
        alert('No daily log found for this date');
        return;
      }

      // Filter goals for this specific report date
      const scheduledGoals = allGoals.filter(g => isGoalDue(g, today));
      
      const html = generateReportHTML({ report, goals: scheduledGoals, log });
      printReport(html);
    } catch (error) {
      console.error('Error generating printable report:', error);
      alert('Failed to generate printable report');
    }
  };

  const handleDownloadHTML = async () => {
    if (!report || !user?.id) return;
    
    try {
      const allGoals = await getUserGoals(user.id);
      const log = await getDailyLog(user.id, today);
      
      if (!log) {
        alert('No daily log found for this date');
        return;
      }
      
      // Filter goals for this specific report date
      const scheduledGoals = allGoals.filter(g => isGoalDue(g, today));
      
      const html = generateReportHTML({ report, goals: scheduledGoals, log });
      const filename = `daily-report-${today}.html`;
      downloadHTMLReport(html, filename);
    } catch (error) {
      console.error('Error generating HTML report:', error);
      alert('Failed to generate HTML report');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="animate-spin text-white/30" /></div>;

  if (!report) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
              <p className="text-white/40">No report generated for today yet.</p>
              <button onClick={() => navigate('/')} className="text-blue-400 hover:underline">Go to Dashboard</button>
          </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 pb-24">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card p-0 overflow-hidden border-2 border-white/5" id="printable-area">
          {/* HEADER */}
          <div className={`p-8 text-center ${report.status === 'PASS' ? 'bg-gradient-to-b from-emerald-500/20 to-transparent' : 'bg-gradient-to-b from-red-500/20 to-transparent'}`}>
              <h1 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Daily Evaluation Report</h1>
              <h2 className="text-3xl font-bold mb-1">{report.dateFormatted}</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold border ${report.status === 'PASS' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                  {report.status === 'PASS' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  STATUS: {report.status}
              </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-2 divide-x divide-white/5 border-y border-white/5">
              <div className="p-6 text-center">
                  <p className="text-xs uppercase font-bold text-white/40 mb-1">Score</p>
                  <p className={`text-4xl font-bold ${report.score >= 80 ? 'text-white' : 'text-white/60'}`}>{report.score}<span className="text-lg text-white/30">/100</span></p>
              </div>
              <div className="p-6 text-center">
                  <p className="text-xs uppercase font-bold text-white/40 mb-1">Completed</p>
                  <p className="text-4xl font-bold text-white">{report.completionStats.completed}<span className="text-lg text-white/30">/{report.completionStats.total}</span></p>
              </div>
          </div>

          {/* HARD FAIL ALERT */}
          {report.hardFailTriggered && (
              <div className="p-6 bg-red-500/10 border-b border-red-500/20">
                  <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                       <XCircle size={14} /> Immediate Failure Triggered
                  </h3>
                  <p className="text-lg text-white font-medium">Breached Rule: "{report.hardFailTriggered}"</p>
                  {report.rootCause && (
                      <p className="text-white/50 text-sm mt-2">Root Cause: <span className="text-red-300 capitalize">{report.rootCause}</span></p>
                  )}
              </div>
          )}

          {/* LISTS */}
          <div className="p-8 space-y-8">
              <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Highlights (What went well)</h3>
                  <ul className="space-y-2">
                      {report.highlights.length > 0 ? (
                          report.highlights.map(h => (
                              <li key={h} className="flex items-start gap-2 text-white/80 text-sm">
                                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                  {h}
                              </li>
                          ))
                      ) : (
                          <li className="text-white/30 text-sm italic">No major highlights today.</li>
                      )}
                  </ul>
              </div>

              <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">Missing (Needs Improvement)</h3>
                  <ul className="space-y-2">
                      {report.missing.length > 0 ? (
                          report.missing.map(m => (
                              <li key={m} className="flex items-start gap-2 text-white/80 text-sm">
                                  <XCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                  {m}
                              </li>
                          ))
                      ) : (
                          <li className="text-white/30 text-sm italic">All active goals completed!</li>
                      )}
                  </ul>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Action Plan for Tomorrow</h3>
                  <ul className="space-y-2">
                      {report.actionPlan.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-white/90 font-medium">
                              <span className="text-blue-500 font-bold">{i+1}.</span>
                              {action}
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </div>

      <div className="flex justify-center gap-4 print:hidden">
          <button 
            onClick={handlePrintPDF} 
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg"
          >
              <Printer size={18} /> Print to PDF
          </button>
          <button 
            onClick={handleDownloadHTML}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
          >
              <FileText size={18} /> Download HTML
          </button>
      </div>
      
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-area, #printable-area * {
                visibility: visible;
            }
            #printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none;
                background: white !important;
                color: black !important;
            }
            /* Override dark mode for print */
            #printable-area .glass-card {
                background: white !important;
                border: 1px solid #ccc !important;
                color: black !important;
            }
            #printable-area p, #printable-area h1, #printable-area h2, #printable-area h3, #printable-area li {
                color: black !important;
            }
            #printable-area .text-white\\/40 { color: #666 !important; }
            #printable-area .text-white\\/60 { color: #444 !important; }
            #printable-area .text-white { color: black !important; }
        }
      `}</style>
    </div>
  );
}
