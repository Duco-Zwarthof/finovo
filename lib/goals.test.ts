import { describe, expect, it } from "vitest";

import type { Goal } from "./goal-types";
import {
  addGoal,
  calculateGoalProgress,
  calculateGoalProgressPercentage,
  calculateMonthsRemaining,
  calculateRequiredMonthlyContributionMinor,
  calculateTotalGoalProgressMinor,
  calculateTotalGoalTargetMinor,
  deleteGoal,
  isValidGoal,
  updateGoal,
} from "./goals";

const houseGoal: Goal = {
  id: "goal-1",
  name: "House deposit",
  targetAmountMinor: 3_000_000,
  currentAmountMinor: 1_200_000,
  targetDate: "2028-08-01",
  status: "active",
};

describe("goals", () => {
  it("validates goals", () => {
    expect(isValidGoal(houseGoal)).toBe(true);

    expect(
      isValidGoal({
        ...houseGoal,
        targetAmountMinor: 0,
      })
    ).toBe(false);

    expect(
      isValidGoal({
        ...houseGoal,
        targetDate: "2028-02-30",
      })
    ).toBe(false);
  });

  it("adds, updates and deletes goals", () => {
    const added = addGoal([], houseGoal);

    expect(added).toEqual([houseGoal]);

    const updated = updateGoal(
      added,
      {
        ...houseGoal,
        currentAmountMinor: 1_500_000,
      }
    );

    expect(
      updated[0].currentAmountMinor
    ).toBe(1_500_000);

    expect(
      deleteGoal(updated, houseGoal.id)
    ).toEqual([]);
  });

  it("rejects duplicate and missing goals", () => {
    expect(() =>
      addGoal([houseGoal], houseGoal)
    ).toThrow("Goal already exists");

    expect(() =>
      updateGoal([], houseGoal)
    ).toThrow(
      "Cannot update a goal that does not exist"
    );
  });

  it("calculates progress percentages", () => {
    expect(
      calculateGoalProgressPercentage(
        1_200_000,
        3_000_000
      )
    ).toBe(40);

    expect(
      calculateGoalProgressPercentage(
        4_000_000,
        3_000_000
      )
    ).toBe(100);
  });

  it("calculates remaining months", () => {
    expect(
      calculateMonthsRemaining(
        "2027-08-15",
        new Date("2026-08-02T12:00:00")
      )
    ).toBe(13);

    expect(
      calculateMonthsRemaining(
        null,
        new Date("2026-08-02T12:00:00")
      )
    ).toBeNull();
  });

  it("calculates required monthly contributions", () => {
    expect(
      calculateRequiredMonthlyContributionMinor(
        1_800_000,
        18
      )
    ).toBe(100_000);

    expect(
      calculateRequiredMonthlyContributionMinor(
        1_800_000,
        null
      )
    ).toBeNull();

    expect(
      calculateRequiredMonthlyContributionMinor(
        1_800_000,
        0
      )
    ).toBeNull();
  });

  it("calculates complete goal progress", () => {
    expect(
      calculateGoalProgress(
        houseGoal,
        new Date("2026-08-02T12:00:00")
      )
    ).toEqual({
      goalId: houseGoal.id,
      targetAmountMinor: 3_000_000,
      currentAmountMinor: 1_200_000,
      remainingAmountMinor: 1_800_000,
      progressPercentage: 40,
      isCompleted: false,
      monthsRemaining: 24,
      requiredMonthlyContributionMinor: 75_000,
    });
  });

  it("calculates total target and progress amounts", () => {
    expect(
      calculateTotalGoalTargetMinor([
        houseGoal,
        {
          ...houseGoal,
          id: "goal-2",
          targetAmountMinor: 500_000,
        },
      ])
    ).toBe(3_500_000);

    expect(
      calculateTotalGoalProgressMinor([
        houseGoal,
        {
          ...houseGoal,
          id: "goal-2",
          currentAmountMinor: 200_000,
        },
      ])
    ).toBe(1_400_000);
  });
});
