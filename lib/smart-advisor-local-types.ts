export type LocalAdvisorTone =
  | "positive"
  | "caution"
  | "neutral";

export type LocalAdvisorVerdict =
  | "safe"
  | "tight"
  | "risky"
  | "informational";

export type LocalAdvisorAssessment = {
  verdict: LocalAdvisorVerdict;
  score: number;
  label: string;
  estimatedMonthlyRoomMinor: number;
};

export type LocalAdvisorAnswer = {
  category:
    | "affordability"
    | "investing"
    | "saving"
    | "cashflow"
    | "general";
  tone: LocalAdvisorTone;
  headline: string;
  summary: string;
  supportingPoints: string[];
  recommendation: string | null;
  disclaimer: string;
  assessment: LocalAdvisorAssessment;
};
