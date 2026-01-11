import Decimal from 'decimal.js';
import { CARD_POSITION_GAP, MIN_POSITION_DELTA } from './card.constants';

export const computeInsertAtTopPosition = (
  minPosition: string | number | null
): {
  position: Decimal;
  needsRebalance: boolean;
} => {
  if (minPosition === null) {
    return {
      position: new Decimal(CARD_POSITION_GAP),
      needsRebalance: false,
    };
  }

  const min = new Decimal(minPosition);
  const position = min.div(2);
  const delta = min.minus(position);

  return {
    position,
    needsRebalance: delta.lt(MIN_POSITION_DELTA),
  };
};
