// /modules/finance-dictionary/
// Silent Empire Financial Simplification Module v1.1
// Adds plain-English translations and tooltips for financial terms (12-year-old friendly).

interface DictionaryTerm {
    term: string;
    display_label: string;
    tooltip: string;
}

interface Dictionary {
    [category: string]: DictionaryTerm[];
}

export const financialDictionary: { categories: Dictionary } = {
  categories: {
    Profitability: [
      {
        term: "Revenue",
        display_label: "Total Sales",
        tooltip: "The total money a company earns from selling products or services."
      },
      {
        term: "Net Income",
        display_label: "Profit",
        tooltip: "The money a company has left over after paying all of its bills and taxes."
      },
      {
        term: "EPS",
        display_label: "Earnings Per Share",
        tooltip: "The amount of profit assigned to each single share of a company's stock."
      },
      {
        term: "Gross Margin",
        display_label: "Profit After Costs",
        tooltip: "How much profit is left after paying for the product's costs."
      },
      {
        term: "EBITDA",
        display_label: "Operating Profit",
        tooltip: "Money a company makes from its regular business before paying interest or taxes."
      }
    ],
    Valuation: [
      {
        term: "P/E Ratio",
        display_label: "Stock Price vs. Profit",
        tooltip: "Shows if a stock costs a lot compared to how much money the company makes."
      },
      {
        term: "Market Cap",
        display_label: "Company Value",
        tooltip: "The total value of all shares of the company combined."
      }
    ],
    BalanceSheet: [
      {
        term: "Liabilities",
        display_label: "Debts",
        tooltip: "Money the company owes to others."
      },
      {
        term: "Assets",
        display_label: "Owned Value",
        tooltip: "Things of value the company owns, like cash, buildings, or machines."
      },
      {
        term: "Equity",
        display_label: "Owner's Value",
        tooltip: "What’s left for the owners after the company pays its debts."
      }
    ],
    CashFlow: [
      {
        term: "Free Cash Flow",
        display_label: "Spare Cash",
        tooltip: "Money left after paying for expenses and investments."
      }
    ],
    Analysis: [
      {
          term: "Primary Risks",
          display_label: "Primary Risks",
          tooltip: "The biggest potential problems that could stop the company from succeeding."
      },
      {
          term: "Mitigating Factors",
          display_label: "Mitigating Factors",
          tooltip: "The actions the company is taking to make the risks less likely or less harmful."
      },
      {
          term: "Confidence Level",
          display_label: "Confidence Level",
          tooltip: "How sure the AI is about its recommendation, based on the data it found."
      }
    ]
  }
};
