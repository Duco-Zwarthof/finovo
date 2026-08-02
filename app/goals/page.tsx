"use client";

import {
  useMemo,
  useState,
} from "react";

import { useHasHydrated } from "@/hooks/useHasHydrated";

import GoalEmptyState from "@/components/goals/GoalEmptyState";
import GoalFormModal from "@/components/goals/GoalFormModal";
import GoalHero from "@/components/goals/GoalHero";
import GoalList from "@/components/goals/GoalList";
import Sidebar from "@/components/layout/Sidebar";
import StorageNotice from "@/components/shared/StorageNotice";

import {
  readStoredGoals,
  writeStoredGoals,
  type GoalStorageReadStatus,
} from "@/lib/goal-storage";
import type { Goal } from "@/lib/goal-types";
import {
  addGoal,
  calculateTotalGoalProgressMinor,
  calculateTotalGoalTargetMinor,
  deleteGoal,
  updateGoal,
} from "@/lib/goals";
import type { StorageWriteResult } from "@/lib/storage";

type GoalStorageHealth =
  | GoalStorageReadStatus
  | "write-failed";

function getStorageNotice(
  status: GoalStorageHealth
) {
  switch (status) {
    case "unavailable":
      return "Goal storage is unavailable. Changes may be lost when you reload this page.";

    case "write-failed":
      return "Your goal changes are visible for this session, but they could not be saved.";

    case "unsupported":
      return "Your saved goal data uses an unsupported version and has not been changed.";

    case "invalid":
      return "Saved goal data could not be read. The original value has not been overwritten.";

    default:
      return null;
  }
}

function getWriteHealth(
  result: StorageWriteResult
): GoalStorageHealth {
  if (result.status === "written") {
    return "valid";
  }

  if (result.status === "unavailable") {
    return "unavailable";
  }

  return "write-failed";
}

function GoalsSkeleton() {
  return (
    <div className="space-y-10">
      <div className="h-[28rem] animate-pulse rounded-[2rem] border border-white/10 bg-zinc-900 xl:h-80" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-3xl border border-white/10 bg-zinc-900"
          />
        ))}
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const hasHydrated = useHasHydrated();

  const [initialResult] = useState(() =>
    readStoredGoals([])
  );

  const [goals, setGoals] = useState<Goal[]>(
    initialResult.value
  );

  const [storageHealth, setStorageHealth] =
    useState<GoalStorageHealth>(
      initialResult.status
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const totalTargetMinor = useMemo(
    () => calculateTotalGoalTargetMinor(goals),
    [goals]
  );

  const totalProgressMinor = useMemo(
    () => calculateTotalGoalProgressMinor(goals),
    [goals]
  );

  const activeGoalCount = goals.filter(
    (goal) => goal.status === "active"
  ).length;

  const storageNotice =
    getStorageNotice(storageHealth);

  function openAddForm() {
    setEditingGoal(null);
    setIsFormOpen(true);
  }

  function openEditForm(goalId: string) {
    const goal = goals.find(
      (candidate) => candidate.id === goalId
    );

    if (!goal) {
      return;
    }

    setEditingGoal(goal);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingGoal(null);
    setIsFormOpen(false);
  }

  function persistGoals(nextGoals: Goal[]) {
    if (
      initialResult.status === "invalid" ||
      initialResult.status === "unsupported" ||
      initialResult.status === "unavailable"
    ) {
      return;
    }

    setStorageHealth(
      getWriteHealth(
        writeStoredGoals(nextGoals)
      )
    );
  }

  function handleSave(goal: Goal) {
    let nextGoals: Goal[];

    try {
      nextGoals = editingGoal
        ? updateGoal(goals, goal)
        : addGoal(goals, goal);
    } catch {
      return;
    }

    setGoals(nextGoals);
    persistGoals(nextGoals);
    closeForm();
  }

  function handleDelete(goalId: string) {
    const nextGoals = deleteGoal(
      goals,
      goalId
    );

    setGoals(nextGoals);
    persistGoals(nextGoals);
    closeForm();
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        {!hasHydrated ? (
          <GoalsSkeleton />
        ) : (
          <>
            <GoalHero
              totalTargetMinor={totalTargetMinor}
              totalProgressMinor={
                totalProgressMinor
              }
              activeGoals={activeGoalCount}
              onAddGoal={openAddForm}
            />

            <StorageNotice
              title="Goal storage notice"
              message={storageNotice}
            />

            <section
              aria-labelledby="goals-title"
              className="mt-10"
            >
              {goals.length === 0 ? (
                <GoalEmptyState
                  onAddGoal={openAddForm}
                />
              ) : (
                <>
                  <div className="mb-4">
                    <h2
                      id="goals-title"
                      className="text-lg font-semibold"
                    >
                      Your goals
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      Select a goal to update its progress, target or status.
                    </p>
                  </div>

                  <GoalList
                    goals={goals}
                    onEditGoal={openEditForm}
                  />
                </>
              )}
            </section>
          </>
        )}
      </section>

      {isFormOpen && (
        <GoalFormModal
          goal={editingGoal ?? undefined}
          onClose={closeForm}
          onSave={handleSave}
          onDelete={
            editingGoal
              ? handleDelete
              : undefined
          }
        />
      )}
    </main>
  );
}
