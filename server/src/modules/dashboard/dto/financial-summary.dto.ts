export interface FinancialSummaryDto {
  financialYear: string;

  purchase: {
    subtotal: number;
    tax: number;
    total: number;
  };

  sales: {
    subtotal: number;
    tax: number;
    total: number;
  };

  profit: {
    grossProfit: number;
  };

  tax: {
    purchaseTax: number;
    salesTax: number;
    netTax: number;
  };
}
