import { Dumbbell, Sparkles, CircleDollarSign, Zap, Heart } from 'lucide-react';

export const DOMAINS = [
  { id: 'physical', title: 'Fisik', icon: Dumbbell, scoreKey: 'physical_score' },
  { id: 'appearance', title: 'Penampilan', icon: Sparkles, scoreKey: 'appearance_score' },
  { id: 'finance', title: 'Finansial', icon: CircleDollarSign, scoreKey: 'finance_score' },
  { id: 'discipline', title: 'Disiplin', icon: Zap, scoreKey: 'discipline_score' },
  { id: 'emotion', title: 'Emosi', icon: Heart, scoreKey: 'emotion_score' },
] as const;

export type DomainId = typeof DOMAINS[number]['id'];
export type ScoreKey = typeof DOMAINS[number]['scoreKey'];
