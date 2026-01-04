/**
 * HTML Report Generator
 * Generates a printable HTML template for daily reports
 */

import type { DailyReport, GoalItem, DailyLogV2 } from './types';
import { format } from 'date-fns';

export interface ReportTemplateData {
  report: DailyReport;
  goals: GoalItem[];
  log: DailyLogV2;
}

export function generateReportHTML(data: ReportTemplateData): string {
  const { report, goals, log } = data;
  
  // Generate checklist rows
  const checklistRows = goals.map(goal => {
    const entry = log.entries[goal.id];
    const isComplete = entry?.isComplete ?? false;
    const value = entry?.value;
    
    let displayValue = '-';
    if (isComplete) {
      if (typeof value === 'boolean') {
        displayValue = value ? '✓' : '✗';
      } else if (typeof value === 'number') {
        displayValue = value.toString();
      } else if (value) {
        displayValue = String(value);
      }
    }
    
    return `
      <tr class="${isComplete ? 'completed' : 'incomplete'}">
        <td class="goal-title">${goal.title}</td>
        <td class="goal-category">${goal.category}</td>
        <td class="goal-status">${isComplete ? '✓' : '✗'}</td>
        <td class="goal-value">${displayValue}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Report - ${report.dateFormatted}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 15mm;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 20px;
      max-width: 210mm;
      margin: 0 auto;
    }
    
    .report-header {
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    
    .report-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .report-header .date {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
    }
    
    .status-pass {
      background: #10b981;
      color: white;
    }
    
    .status-fail {
      background: #ef4444;
      color: white;
    }
    
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    
    .metric-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      background: #f9fafb;
    }
    
    .metric-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .metric-value .unit {
      font-size: 16px;
      color: #9ca3af;
      font-weight: 500;
    }
    
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    .checklist-table th {
      background: #f3f4f6;
      text-align: left;
      padding: 10px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #d1d5db;
    }
    
    .checklist-table td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .checklist-table tr.completed {
      background: #ecfdf5;
    }
    
    .checklist-table tr.incomplete {
      background: #fef2f2;
    }
    
    .goal-status {
      font-size: 16px;
      font-weight: 700;
    }
    
    .list-item {
      padding: 10px 15px;
      background: #f9fafb;
      border-left: 3px solid #3b82f6;
      margin-bottom: 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .list-item.gap {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    
    .list-item.action {
      border-left-color: #10b981;
      background: #ecfdf5;
    }
    
    .alert {
      background: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    
    .alert-title {
      font-weight: 700;
      color: #991b1b;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .alert-content {
      color: #7f1d1d;
      font-size: 13px;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>Daily Evaluation Report</h1>
    <div class="date">${report.dateFormatted}</div>
    <span class="status-badge ${report.status === 'PASS' ? 'status-pass' : 'status-fail'}">
      ${report.status}
    </span>
  </div>
  
  ${report.hardFailTriggered ? `
    <div class="alert">
      <div class="alert-title">⚠️ Hard Fail Triggered</div>
      <div class="alert-content">
        <strong>Rule:</strong> ${report.hardFailTriggered}<br>
        ${report.rootCause ? `<strong>Root Cause:</strong> ${report.rootCause}` : ''}
      </div>
    </div>
  ` : ''}
  
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-label">Score</div>
      <div class="metric-value">${report.score}<span class="unit">/100</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Completed</div>
      <div class="metric-value">${report.completionStats.completed}<span class="unit">/${report.completionStats.total}</span></div>
    </div>
  </div>
  
  <div class="section">
    <h2 class="section-title">Daily Checklist</h2>
    <table class="checklist-table">
      <thead>
        <tr>
          <th>Goal</th>
          <th>Category</th>
          <th>Status</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        ${checklistRows}
      </tbody>
    </table>
  </div>
  
  ${report.highlights.length > 0 ? `
    <div class="section">
      <h2 class="section-title">✅ Highlights</h2>
      ${report.highlights.map(h => `<div class="list-item">${h}</div>`).join('')}
    </div>
  ` : ''}
  
  ${report.missing.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⚠️ Gaps & Areas for Improvement</h2>
      ${report.missing.map(m => `<div class="list-item gap">${m}</div>`).join('')}
    </div>
  ` : ''}
  
  ${report.actionPlan.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🎯 Action Plan for Tomorrow</h2>
      ${report.actionPlan.map((a, i) => `<div class="list-item action"><strong>${i + 1}.</strong> ${a}</div>`).join('')}
    </div>
  ` : ''}
  
  <div class="footer">
    Generated on ${format(new Date(), 'EEEE, d MMMM yyyy HH:mm')} • Goal Tracker System
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download HTML as file
 */
export function downloadHTMLReport(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print report using browser's print dialog
 */
export function printReport(html: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
