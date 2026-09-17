interface FinancialSummary {
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatFinancialSummary = (data: FinancialSummary): string => {
  return `For financial year ${data.financialYear}, your total sales are ${formatCurrency(
    data.sales.total,
  )}, total purchases are ${formatCurrency(
    data.purchase.total,
  )}, gross profit is ${formatCurrency(
    data.profit.grossProfit,
  )}, and net tax is ${formatCurrency(data.tax.netTax)}.`;
};

export const formatTotalSales = (data: FinancialSummary): string => {
  return `For financial year ${data.financialYear}, your total sales are ${formatCurrency(
    data.sales.total,
  )}.`;
};

export const formatTotalPurchases = (data: FinancialSummary): string => {
  return `For financial year ${data.financialYear}, your total purchases are ${formatCurrency(
    data.purchase.total,
  )}.`;
};

export const formatGrossProfit = (data: FinancialSummary): string => {
  return `For financial year ${data.financialYear}, your gross profit is ${formatCurrency(
    data.profit.grossProfit,
  )}.`;
};

export const formatNetTax = (data: FinancialSummary): string => {
  return `For financial year ${data.financialYear}, your net tax is ${formatCurrency(
    data.tax.netTax,
  )}.`;
};
