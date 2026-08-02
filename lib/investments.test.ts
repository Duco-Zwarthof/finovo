import { describe, expect, it } from "vitest";

import type { InvestmentHolding } from "./investment-types";
import {
  addInvestmentHolding,
  calculateHoldingCostMinor,
  calculateHoldingGainMinor,
  calculateHoldingGainPercentage,
  calculateHoldingValueMinor,
  calculatePortfolioCostMinor,
  calculatePortfolioGainMinor,
  calculatePortfolioGainPercentage,
  calculatePortfolioValueMinor,
  deleteInvestmentHolding,
  isValidInvestmentHolding,
  updateInvestmentHolding,
} from "./investments";

const worldEtf: InvestmentHolding = {
  id: "holding-1",
  name: "Vanguard FTSE All-World",
  symbol: "VWCE",
  assetType: "etf",
  quantity: 10,
  averageBuyPriceMinor: 10_000,
  currentPriceMinor: 12_000,
};

const stock: InvestmentHolding = {
  id: "holding-2",
  name: "Example Stock",
  symbol: "EXM",
  assetType: "stock",
  quantity: 5,
  averageBuyPriceMinor: 5_000,
  currentPriceMinor: 4_000,
};

describe("investments", () => {
  it("validates investment holdings", () => {
    expect(
      isValidInvestmentHolding(worldEtf)
    ).toBe(true);

    expect(
      isValidInvestmentHolding({
        ...worldEtf,
        quantity: 0,
      })
    ).toBe(false);
  });

  it("calculates holding totals and return", () => {
    expect(
      calculateHoldingCostMinor(worldEtf)
    ).toBe(100_000);

    expect(
      calculateHoldingValueMinor(worldEtf)
    ).toBe(120_000);

    expect(
      calculateHoldingGainMinor(worldEtf)
    ).toBe(20_000);

    expect(
      calculateHoldingGainPercentage(worldEtf)
    ).toBe(20);
  });

  it("calculates portfolio totals and return", () => {
    const holdings = [worldEtf, stock];

    expect(
      calculatePortfolioCostMinor(holdings)
    ).toBe(125_000);

    expect(
      calculatePortfolioValueMinor(holdings)
    ).toBe(140_000);

    expect(
      calculatePortfolioGainMinor(holdings)
    ).toBe(15_000);

    expect(
      calculatePortfolioGainPercentage(holdings)
    ).toBe(12);
  });

  it("adds, updates and deletes holdings", () => {
    const added = addInvestmentHolding(
      [],
      worldEtf
    );

    expect(added).toEqual([worldEtf]);

    const updated =
      updateInvestmentHolding(added, {
        ...worldEtf,
        currentPriceMinor: 13_000,
      });

    expect(
      updated[0].currentPriceMinor
    ).toBe(13_000);

    expect(
      deleteInvestmentHolding(
        updated,
        worldEtf.id
      )
    ).toEqual([]);
  });

  it("rejects duplicate and missing holdings", () => {
    expect(() =>
      addInvestmentHolding(
        [worldEtf],
        worldEtf
      )
    ).toThrow(
      "Investment holding already exists"
    );

    expect(() =>
      updateInvestmentHolding(
        [],
        worldEtf
      )
    ).toThrow(
      "Cannot update an investment holding that does not exist"
    );
  });
});
