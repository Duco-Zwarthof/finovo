import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_SCENARIO_SETTINGS,
  parseScenarioSettings,
} from "./scenario-settings";

describe("scenario settings", () => {
  it("accepts valid saved settings", () => {
    const result =
      parseScenarioSettings({
        extraIncomeEuro: 250,
        extraExpensesEuro: 50,
        extraInvestingEuro: 200,
        years: 10,
        bearReturn: 2,
        baseReturn: 6,
        bullReturn: 9,
      });

    expect(result).toEqual({
      extraIncomeEuro: 250,
      extraExpensesEuro: 50,
      extraInvestingEuro: 200,
      years: 10,
      bearReturn: 2,
      baseReturn: 6,
      bullReturn: 9,
    });
  });

  it("falls back for invalid horizons", () => {
    expect(
      parseScenarioSettings({
        ...DEFAULT_SCENARIO_SETTINGS,
        years: 7,
      })
    ).toEqual(
      DEFAULT_SCENARIO_SETTINGS
    );
  });

  it("falls back for negative euro inputs", () => {
    expect(
      parseScenarioSettings({
        ...DEFAULT_SCENARIO_SETTINGS,
        extraInvestingEuro: -1,
      })
    ).toEqual(
      DEFAULT_SCENARIO_SETTINGS
    );
  });

  it("falls back for impossible return assumptions", () => {
    expect(
      parseScenarioSettings({
        ...DEFAULT_SCENARIO_SETTINGS,
        bullReturn: 101,
      })
    ).toEqual(
      DEFAULT_SCENARIO_SETTINGS
    );
  });

  it("falls back for malformed values", () => {
    expect(
      parseScenarioSettings(null)
    ).toEqual(
      DEFAULT_SCENARIO_SETTINGS
    );
  });
});
