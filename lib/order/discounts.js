/**
 * Automatic basket discounts.
 *
 * A DELIBERATE MIRROR of the backend's compute_auto_discount
 * (satwik-farms-backend main.py). The server validates every discount a client
 * claims, so if these two ever disagree it rejects exactly what the customer was
 * shown. They are written to be read side by side — change one, change both.
 *
 * Customers were not typing promo codes; many did not realise they had to. So
 * everything applies by itself and is shown at checkout instead.
 *
 * Three kinds, all driven from the Sheet so the owner changes them without a
 * release:
 *
 *   tier        spend-based percentage, from the discount_tiers tab
 *   auto_promo  a promo code flagged auto_apply, once its minimum spend is met
 *   promo_code  a typed code — still honoured, nothing that worked stops working
 *
 * The customer gets the SINGLE BEST of these, never a stack. Stacking is easy to
 * write and hard to explain, and a discount nobody can explain is one that gets
 * argued about at the door.
 */

/**
 * Round money off UP to the nearest 100 TSH (owner's decision, 2026-08-06).
 *
 * Up, not down: 3% of 25,000 is 750 and the customer gets 800. It costs at most
 * 99 TSH an order, and prices here are whole hundreds anyway — a total ending in
 * 50 would look like a mistake.
 */
export function roundDiscountUp(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.ceil(amount / 100) * 100;
}

/** The highest spend tier this basket qualifies for. Tiers do not stack. */
export function bestTier(subtotal, tiers) {
  const qualifying = (tiers ?? []).filter(
    (t) => t.isActive !== false && Number(subtotal) >= Number(t.minSpend ?? 0),
  );
  if (qualifying.length === 0) return null;
  return qualifying.reduce((a, b) =>
    (Number(b.minSpend ?? 0) > Number(a.minSpend ?? 0) ? b : a));
}

/**
 * The best discount this basket is entitled to.
 *
 * Returns { amount, label, source, code } — amount 0 when nothing applies.
 */
export function computeAutoDiscount(subtotal, catalog, typedCode = null) {
  const none = { amount: 0, label: null, source: null, code: null };
  const sub = Number(subtotal) || 0;
  if (!catalog || sub <= 0) return none;

  const candidates = [];

  const tier = bestTier(sub, catalog.discountTiers);
  if (tier) {
    const amount = roundDiscountUp((sub * Number(tier.percentOff ?? 0)) / 100);
    if (amount > 0) {
      candidates.push({
        amount,
        label: tier.label || `${tier.percentOff}% off`,
        source: 'tier',
        code: tier.id ?? null,
      });
    }
  }

  const wanted = String(typedCode ?? '').trim().toUpperCase();
  for (const promo of catalog.promoCodes ?? []) {
    if (!promo.active) continue;
    const code = String(promo.code ?? '').trim().toUpperCase();
    const auto = Boolean(promo.autoApply);
    const typed = Boolean(wanted) && wanted === code;
    if (!auto && !typed) continue;
    if (sub < Number(promo.minimumSpend ?? 0)) continue;
    const amount = Number(promo.amountOff ?? 0);
    if (amount <= 0) continue;
    candidates.push({
      amount,
      label: promo.label || `${code} discount`,
      source: auto ? 'auto_promo' : 'promo_code',
      code,
    });
  }

  if (candidates.length === 0) return none;
  // Best for the customer; ties go to the tier, which needs no code to explain.
  return candidates.reduce((a, b) => {
    if (b.amount !== a.amount) return b.amount > a.amount ? b : a;
    return a.source === 'tier' ? a : b;
  });
}

/**
 * What a combo saved, versus buying its contents separately.
 *
 * Shown at checkout because a combo's saving is otherwise invisible: its lines
 * are already discounted, so the basket just looks cheap for no stated reason.
 */
export function comboSavings(cartItems, catalog) {
  if (!catalog) return [];
  const byId = new Map((catalog.combos ?? []).map((c) => [c.id, c]));
  const unitsByCombo = new Map();
  for (const item of cartItems ?? []) {
    if (!item.comboId) continue;
    unitsByCombo.set(item.comboId, (unitsByCombo.get(item.comboId) ?? 0) + item.quantity);
  }
  const out = [];
  for (const [comboId, units] of unitsByCombo) {
    const combo = byId.get(comboId);
    if (!combo) continue;
    const totalUnits = (combo.lineItems ?? []).reduce((s, l) => s + l.quantity, 0);
    if (totalUnits <= 0) continue;
    // A partly-added combo saves pro rata; the customer only has some of it.
    const share = units / totalUnits;
    const full = Number(combo.originalPrice ?? 0) - Number(combo.price ?? 0);
    const saved = Math.round(full * share);
    if (saved > 0) {
      out.push({ comboId, name: combo.name, saved, units, totalUnits });
    }
  }
  return out;
}

/** Everything the customer should see about their money, in one place. */
export function orderTotals(subtotal, deliveryFee, catalog, cartItems, typedCode = null) {
  const discount = computeAutoDiscount(subtotal, catalog, typedCode);
  // Clamp: a discount must never exceed the basket and produce a negative total.
  const amount = Math.min(discount.amount, subtotal);
  return {
    subtotal,
    deliveryFee,
    discount: { ...discount, amount },
    comboSavings: comboSavings(cartItems, catalog),
    total: Math.max(0, subtotal + deliveryFee - amount),
  };
}
