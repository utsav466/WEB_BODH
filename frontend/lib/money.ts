export function money(amount: number) {
  const n = Number(amount || 0);
  const formatted = new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

  return `Rs ${formatted}`;
}