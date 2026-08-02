import type { Goal } from "@/lib/goal-types";

import GoalCard from "./GoalCard";

type GoalListProps = {
  goals: readonly Goal[];
  onEditGoal?: (goalId: string) => void;
};

export default function GoalList({
  goals,
  onEditGoal,
}: GoalListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEditGoal}
        />
      ))}
    </div>
  );
}
