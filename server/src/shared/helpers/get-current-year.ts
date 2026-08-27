export const getCurrentFinancialYear = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = January

  if (month >= 3) {
    return {
      start: new Date(year, 3, 1),
      end: new Date(year + 1, 2, 31, 23, 59, 59, 999),
      label: `${year}-${year + 1}`,
    };
  }

  return {
    start: new Date(year - 1, 3, 1),
    end: new Date(year, 2, 31, 23, 59, 59, 999),
    label: `${year - 1}-${year}`,
  };
};
