const API_URL = "https://open.er-api.com/v6/latest/EUR"; // Base currency: EUR
const CACHE_KEY = "exchangeRatesCache";
const CACHE_TTL = 1000 * 60 * 60 * 24; // Cache time-to-live: 24 hours (in milliseconds)

/**
 * Fetch exchange rates with caching to localStorage.
 * Returns rates object with currency codes and their exchange rates relative to EUR.
 * 
 * @returns {Promise<Object>} - Exchange rates, e.g. { EUR: 1, USD: 1.1, ... }
 */
export async function getExchangeRates() {
  // Check if rates are cached in localStorage
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);

    // If cached data is still valid (not expired), use it
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log("Using cached exchange rates:", data);
      return data; // Return cached rates object
    }
  }

  // Fetch fresh exchange rates from API
  const res = await fetch(API_URL);

  // Throw error if response is not OK
  if (!res.ok) throw new Error("Failed to fetch exchange rates");

  // Parse JSON response
  const json = await res.json();
  console.log("Fetched exchange rates response:", json);

  // Validate presence of rates object in response
  if (!json.rates) throw new Error("Invalid data structure: missing rates");

  // Cache the rates object along with the current timestamp
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: json.rates,
    })
  );

  // Return fresh rates
  return json.rates;
}
