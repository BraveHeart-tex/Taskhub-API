import Decimal from 'decimal.js';

export const LIST_POSITION_GAP = new Decimal(1000);
const MIN_POSITION_DELTA = new Decimal(0.0001);

export function computeInsertBetweenListPositions({
  before,
  after,
}: {
  before: string | null;
  after: string | null;
}) {
  // empty board
  if (!before && !after) {
    return {
      position: LIST_POSITION_GAP,
      needsRebalance: false,
    };
  }

  // insert at end
  if (after && !before) {
    return {
      position: new Decimal(after).plus(LIST_POSITION_GAP),
      needsRebalance: false,
    };
  }

  // insert at start
  if (before && !after) {
    const pos = new Decimal(before).div(2);
    return {
      position: pos,
      needsRebalance: pos.lt(MIN_POSITION_DELTA),
    };
  }

  // insert between
  const beforeDec = new Decimal(before!);
  const afterDec = new Decimal(after!);
  const pos = beforeDec.plus(afterDec).div(2);

  return {
    position: pos,
    needsRebalance: afterDec.minus(pos).lt(MIN_POSITION_DELTA),
  };
}
