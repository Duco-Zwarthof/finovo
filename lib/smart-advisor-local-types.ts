export type LocalAdvisorTone =
  | "positive"
  | "caution"
  | "neutral";

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
};
