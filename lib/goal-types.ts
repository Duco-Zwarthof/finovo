export const GOAL_STATUSES = [
  "active",
  "completed",
  "paused",
] as const;

export type GoalStatus =
  (typeof GOAL_STATUSES)[number];

export type Goal = {
  id: string;
  name: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate: string | null;
  status: GoalStatus;
};

export type GoalProgress = {
  goalId: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  remainingAmountMinor: number;
  progressPercentage: number;
  isCompleted: boolean;
  monthsRemaining: number | null;
  requiredMonthlyContributionMinor: number | null;
};
