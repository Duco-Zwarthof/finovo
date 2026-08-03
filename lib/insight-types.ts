export const INSIGHT_LEVELS = [
  "success",
  "warning",
  "info",
] as const;

export type InsightLevel =
  (typeof INSIGHT_LEVELS)[number];

export const INSIGHT_PRIORITIES = [
  "high",
  "medium",
  "low",
] as const;

export type InsightPriority =
  (typeof INSIGHT_PRIORITIES)[number];

export type FinancialInsight = {
  id: string;
  level: InsightLevel;
  priority: InsightPriority;
  title: string;
  description: string;
  actionLabel: string | null;
  actionHref: string | null;
};
