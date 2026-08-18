/**
 * Saying how much of something the customer is actually getting.
 *
 * A combo of "0.5 Kg × 4" is two kilos of potato, and that is what the shopper
 * is thinking in. Showing the pack size and a multiplier makes them do the sum
 * themselves, and the answer they want is the one we already know.
 *
 * Deliberately conservative: anything this cannot parse confidently is returned
 * in the original "unit × n" form rather than guessed at. A wrong quantity on a
 * grocery order is worse than an unhelpful one.
 */

const WEIGHT = /^\s*(\d+(?:\.\d+)?)\s*(kg|kgs|g|gram|grams)\s*$/i;
const VOLUME = /^\s*(\d+(?:\.\d+)?)\s*(ml|millilitre|millilitres|l|lt|ltr|litre|litres|liter|liters)\s*$/i;
const COUNT = /^\s*(\d+)\s*([a-z]+)\s*$/i;

/** "1.50" -> "1.5", "2.00" -> "2" — trailing zeros read as false precision. */
function tidy(n) {
  return Number(n.toFixed(3)).toString();
}

/** Rough plurals, enough for the nouns this catalogue actually uses. */
function plural(noun, n) {
  if (n === 1) return noun;
  const lower = noun.toLowerCase();
  if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('ch') || lower.endsWith('sh')) {
    return `${noun}es`;
  }
  return `${noun}s`;
}

/**
 * How much you get in total, in the unit a shopper thinks in.
 *
 * totalQuantityLabel('0.5 Kg', 4)  -> '2 Kg'
 * totalQuantityLabel('250 gram', 4) -> '1 Kg'
 * totalQuantityLabel('1 piece', 4)  -> '4 pieces'
 * totalQuantityLabel('100 ml', 3)   -> '300 ml'
 */
export function totalQuantityLabel(unit, quantity) {
  const qty = Number(quantity) || 0;
  const text = String(unit ?? '').trim();
  if (!text || qty <= 0) return null;

  const weight = WEIGHT.exec(text);
  if (weight) {
    const each = Number(weight[1]);
    const inGrams = /^(g|gram|grams)$/i.test(weight[2]) ? each : each * 1000;
    const total = inGrams * qty;
    // Grams up to a kilo stay grams; a shopper asked for 250g, not 0.25 Kg.
    return total >= 1000 ? `${tidy(total / 1000)} Kg` : `${tidy(total)} g`;
  }

  const volume = VOLUME.exec(text);
  if (volume) {
    const each = Number(volume[1]);
    const inMl = /^(ml|millilitre|millilitres)$/i.test(volume[2]) ? each : each * 1000;
    const total = inMl * qty;
    return total >= 1000 ? `${tidy(total / 1000)} L` : `${tidy(total)} ml`;
  }

  const count = COUNT.exec(text);
  if (count) {
    const total = Number(count[1]) * qty;
    return `${tidy(total)} ${plural(count[2], total)}`;
  }

  // Unparseable — say it plainly rather than inventing a number.
  return qty === 1 ? text : `${text} x ${tidy(qty)}`;
}
