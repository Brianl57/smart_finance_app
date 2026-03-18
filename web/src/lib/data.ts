export const mockSpending = [
  { label: "Food", value: 450, color: "#FF6B6B" },
  { label: "Rent", value: 1200, color: "#4ECDC4" },
  { label: "Shopping", value: 300, color: "#45B7D1" },
];

export const mockTotalNetworth = 687041.79;

export const mockTotalNetworthTimeSeries = [
  { day: 0, networth: 663000 },
  { day: 2, networth: 666000 },
  { day: 4, networth: 668000 },
  { day: 6, networth: 669500 },
  { day: 8, networth: 671000 },
  { day: 10, networth: 670000 },
  { day: 12, networth: 673000 },
  { day: 14, networth: 675000 },
  { day: 16, networth: 677000 },
  { day: 18, networth: 679000 },
  { day: 20, networth: 680000 },
  { day: 22, networth: 681500 },
  { day: 24, networth: 682000 },
  { day: 26, networth: 684000 },
  { day: 28, networth: 686000 },
  { day: 30, networth: 687041.79 },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
