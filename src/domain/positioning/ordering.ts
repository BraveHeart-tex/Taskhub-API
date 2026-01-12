import Decimal from 'decimal.js';

export const POSITION_GAP = new Decimal(1000);
const MIN_GAP = new Decimal('0.0000000001');

export function computeInsertAtBottomPosition(max: string | null): {
  position: Decimal;
  needsRebalance: boolean;
} {
  if (max === null) {
    return {
      position: POSITION_GAP,
      needsRebalance: false,
    };
  }

  const next = new Decimal(max).add(POSITION_GAP);

  return {
    position: next,
    needsRebalance: false, // bottom inserts never squeeze
  };
}

export function computeNewPosition(
  before?: string | null,
  after?: string | null
): { position: Decimal; needsRebalance: boolean } {
  // Empty container
  if (!before && !after) {
    return {
      position: POSITION_GAP,
      needsRebalance: false,
    };
  }

  // Append (right / bottom)
  if (before && !after) {
    return {
      position: new Decimal(before).plus(POSITION_GAP),
      needsRebalance: false,
    };
  }

  // Prepend (left / top)
  if (!before && after) {
    return {
      position: new Decimal(after).minus(POSITION_GAP),
      needsRebalance: false,
    };
  }

  // Insert between
  const left = new Decimal(before!);
  const right = new Decimal(after!);
  const diff = right.minus(left);

  if (diff.lte(MIN_GAP)) {
    return {
      position: left,
      needsRebalance: true,
    };
  }

  return {
    position: left.plus(diff.div(2)),
    needsRebalance: false,
  };
}
