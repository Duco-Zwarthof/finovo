export const SCENARIO_SETTINGS_STORAGE_KEY =
  "finovo-scenario-settings";

export const SCENARIO_HORIZONS = [
  1,
  3,
  5,
  10,
] as const;

export type ScenarioHorizonYears =
  (typeof SCENARIO_HORIZONS)[number];

export type ScenarioSettings = {
  extraIncomeEuro: number;
  extraExpensesEuro: number;
  extraInvestingEuro: number;
  years: ScenarioHorizonYears;
  bearReturn: number;
  baseReturn: number;
  bullReturn: number;
};

export const DEFAULT_SCENARIO_SETTINGS: ScenarioSettings =
  {
    extraIncomeEuro: 0,
    extraExpensesEuro: 0,
    extraInvestingEuro: 0,
    years: 5,
    bearReturn: 2,
    baseReturn: 6,
    bullReturn: 9,
  };

function isFiniteNonNegative(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isReturnPercent(
  value: unknown
): value is number {
  return (
    isFiniteNonNegative(value) &&
    value <= 100
  );
}

function isScenarioHorizon(
  value: unknown
): value is ScenarioHorizonYears {
  return (
    typeof value === "number" &&
    SCENARIO_HORIZONS.includes(
      value as ScenarioHorizonYears
    )
  );
}

export function parseScenarioSettings(
  value: unknown
): ScenarioSettings {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return DEFAULT_SCENARIO_SETTINGS;
  }

  const candidate =
    value as Partial<ScenarioSettings>;

  if (
    !isFiniteNonNegative(
      candidate.extraIncomeEuro
    ) ||
    !isFiniteNonNegative(
      candidate.extraExpensesEuro
    ) ||
    !isFiniteNonNegative(
      candidate.extraInvestingEuro
    ) ||
    !isScenarioHorizon(
      candidate.years
    ) ||
    !isReturnPercent(
      candidate.bearReturn
    ) ||
    !isReturnPercent(
      candidate.baseReturn
    ) ||
    !isReturnPercent(
      candidate.bullReturn
    )
  ) {
    return DEFAULT_SCENARIO_SETTINGS;
  }

  return {
    extraIncomeEuro:
      candidate.extraIncomeEuro,
    extraExpensesEuro:
      candidate.extraExpensesEuro,
    extraInvestingEuro:
      candidate.extraInvestingEuro,
    years: candidate.years,
    bearReturn:
      candidate.bearReturn,
    baseReturn:
      candidate.baseReturn,
    bullReturn:
      candidate.bullReturn,
  };
}

export function readScenarioSettings():
  ScenarioSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SCENARIO_SETTINGS;
  }

  try {
    const raw =
      window.localStorage.getItem(
        SCENARIO_SETTINGS_STORAGE_KEY
      );

    if (!raw) {
      return DEFAULT_SCENARIO_SETTINGS;
    }

    return parseScenarioSettings(
      JSON.parse(raw)
    );
  } catch {
    return DEFAULT_SCENARIO_SETTINGS;
  }
}

export function writeScenarioSettings(
  settings: ScenarioSettings
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    SCENARIO_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}
