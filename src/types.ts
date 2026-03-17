export interface QuizData {
  user_name: string;
  email?: string;
  primary_drain: string;
  social_style: string;
  current_battery: string;
  recovery_preference: string;
  age_group: '18-29' | '30+';
}

export interface SocialProfile {
  type: string;
  validation: string;
  microRecoveries: string[];
  invitation: string;
}

export interface BoundaryScripts {
  gentle: string;
  direct: string;
  business: string;
}

export type Page = 'home' | 'quiz' | 'result' | 'boundary' | 'blog';
