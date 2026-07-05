export const MINIMUM_ORDER_TOTAL_COP = 50000;

export function getMinimumOrderMissing(total: number): number {
  return Math.max(MINIMUM_ORDER_TOTAL_COP - total, 0);
}

export function meetsMinimumOrder(total: number): boolean {
  return getMinimumOrderMissing(total) === 0;
}
