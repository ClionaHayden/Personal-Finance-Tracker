export default function TransactionFilters({
  setFilters,
  categories,
  displayCurrency,
  setDisplayCurrency,
}) {
  // Update the filter for transaction type (income, expense, or all)
  const handleTypeChange = (e) => 
    setFilters((prev) => ({ ...prev, type: e.target.value }));

  // Update the filter for category (or all)
  const handleCategoryChange = (e) => 
    setFilters((prev) => ({ ...prev, category: e.target.value }));

  return (
    <div>
      {/* Filter transactions by type */}
      <label>Filter by Type:</label>
      <select onChange={handleTypeChange}>
        <option value="">All</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* Filter transactions by category */}
      <label>Filter by Category:</label>
      <select onChange={handleCategoryChange}>
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Select display currency */}
      <select
        value={displayCurrency}
        onChange={(e) => setDisplayCurrency(e.target.value)}
        style={{ marginBottom: "1rem" }}
      >
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
      </select>
    </div>
  );
}
