export type ToneType = 'hard-selling' | 'soft-selling' | 'humor-genz' | 'emak-emak';

export type PlatformType = 'instagram' | 'marketplace' | 'tiktok';

export interface CopyRequest {
  productName: string;
  productDescription: string;
  tone: ToneType;
  platform: PlatformType;
  additionalNotes?: string;
}

export interface FormulaBreakdown {
  attentionOrProblem: string;
  interestOrAgitation: string;
  desireOrSolution: string;
  action: string;
}

export interface CopyResult {
  id: string;
  caption: string;
  hook: string;
  formula: 'AIDA' | 'PAS' | 'FAB' | '4P';
  formulaBreakdown: FormulaBreakdown;
  hashtags: string[];
  bestPostingTime: string;
  proTip: string;
  timestamp: number;
  productName: string;
  productDescription?: string;
  tone: ToneType;
  platform: PlatformType;
}

export interface PresetProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  tone: ToneType;
  platform: PlatformType;
  badge: string;
}
