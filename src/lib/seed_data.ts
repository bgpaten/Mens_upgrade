import { saveGoal } from './supabase-v11';
import type { GoalItem } from './types';

export const DEFAULT_GOALS: Omit<GoalItem, 'id' | 'userId' | 'createdAt'>[] = [
  {
    title: "Subuh Jamaah",
    category: "Spiritual",
    period: "daily",
    targetType: "boolean",
    isHardFail: false,
    active: true
  },
  {
    title: "Deep Work",
    description: "Fokus kerja tanpa distraksi",
    category: "Work/Build",
    period: "daily",
    targetType: "time", // minutes
    targetValue: 60,
    isHardFail: false,
    active: true
  },
  {
    title: "Build Mode (Ba'da Isya)",
    description: "Coding / Project sampingan",
    category: "Work/Build",
    period: "daily",
    targetType: "time",
    targetValue: 90, 
    isHardFail: false,
    active: true
  },
  {
    title: "Workout",
    category: "Health",
    period: "daily",
    targetType: "time",
    targetValue: 30,
    isHardFail: false,
    active: true
  },
  {
    title: "Pantau Pengeluaran",
    description: "Catat pengeluaran hari ini",
    category: "Finance",
    period: "daily",
    targetType: "numeric",
    isHardFail: false,
    active: true
  },
  {
    title: "Nyomot Tabungan / Investasi?",
    description: "Apakah hari ini menarik dana tabungan?",
    category: "Finance",
    period: "daily",
    targetType: "boolean",
    isHardFail: true, // HARD FAIL
    active: true
  },
  {
    title: "Mood Rating",
    category: "Emotion",
    period: "daily",
    targetType: "scale",
    isHardFail: false,
    active: true
  }
];

export async function seedDefaultGoals(userId: string) {
    console.log(`Seeding goals for ${userId}...`);
    for (const g of DEFAULT_GOALS) {
        const id = crypto.randomUUID();
        await saveGoal(userId, {
            ...g,
            id,
            userId,
            createdAt: new Date().toISOString()
        });
    }
    console.log("Seeding complete.");
}
