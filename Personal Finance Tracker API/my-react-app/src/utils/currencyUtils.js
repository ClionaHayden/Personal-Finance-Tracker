/**
 * Convert an amount from one currency to another using exchange rates.
 *
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The original currency code (e.g., "EUR").
 * @param {string} toCurrency - The target currency code (e.g., "USD").
 * @param {object} rates - The exchange rates object, e.g.:
 *   {
 *     base: "USD",
 *     rates: { EUR: 0.91, JPY: 139.12, GBP: 0.78 }
 *   }
 * @returns {number} - The converted amount.
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  // If no rates object is provided, warn and return original amount
  if (!rates) {
    console.warn("No exchange rates provided");
    return amount;
  }

  // If source and target currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;

  // Extract rates for the source and target currencies from the rates object
  const rateFrom = rates[fromCurrency];
  const rateTo = rates[toCurrency];

  // If either currency rate is missing, warn and return original amount
  if (rateFrom === undefined || rateTo === undefined) {
    console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`, rates);
    return amount;
  }

  // Convert the amount to the base currency by dividing by source currency rate
  const amountInBase = amount / rateFrom;

  // Convert from base currency to the target currency by multiplying by target rate
  const convertedAmount = amountInBase * rateTo;

  // Round to two decimal places for currency formatting and return
  return Math.round(convertedAmount * 100) / 100;
}
