import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import TransactionFormButton from "../components/TransactionFormButton";
import TransactionFilters from "../components/TransactionFilters";
import TransactionTable from "../components/TransactionTable";
import BudgetSummary from "../components/BudgetSummary";
import ToggleGraphsButton from "../components/ToggleGraphsButton";
import ExportMenu from "../components/ExportMenu";
import useAuth from "../hooks/useAuth";
import useTransactions from "../hooks/useTransactions";
import useCategories from "../hooks/useCategories";
import { getExchangeRates } from "../utils/exchangeRates";

export default function Dashboard() {
  // Get the current authenticated user and logout function from useAuth
  const { user, logout } = useAuth();

  // Destructure transaction-related state and functions from custom hook
  const {
    transactions,
    addTx,
    updateTx,
    deleteTx,
    editingTx,
    startEdit,
    cancelEdit,
    filteredTransactions,
    setFilters,
  } = useTransactions();

  // Fetch categories (e.g. Food, Utilities) for transaction classification
  const { categories } = useCategories();

  // Local state for currently displayed currency (default EUR)
  const [displayCurrency, setDisplayCurrency] = useState("EUR");

  // Local state to store exchange rates fetched from an API or utility function
  const [exchangeRates, setExchangeRates] = useState(null);

  // On component mount, load exchange rates asynchronously
  useEffect(() => {
    async function loadRates() {
      try {
        const rates = await getExchangeRates();
        console.log("Loaded exchange rates in component:", rates);
        setExchangeRates(rates);
      } catch (e) {
        console.error("Failed to load exchange rates:", e);
      }
    }
    loadRates();
  }, []);

  // If user is not yet loaded, show loading state
  if (!user) return <p>Loading...</p>;

  return (
    <div>
      {/* Header shows user info and logout button */}
      <Header user={user} onLogout={logout} />

      {/* Show a summary of budgets and expenses by category */}
      <BudgetSummary categories={categories} transactions={transactions} />

      {/* Button to toggle showing graphs/charts related to finances */}
      <ToggleGraphsButton categories={categories} transactions={transactions} />

      {/* Button that toggles form for adding or editing transactions */}
      <TransactionFormButton
        onAdd={addTx}
        onUpdate={updateTx}
        onCancelEdit={cancelEdit}
        editingTx={editingTx}
        categories={categories}
      />

      {/* Filters to filter transactions by category/type and select display currency */}
      <TransactionFilters
        setFilters={setFilters}
        categories={categories}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
      />

      {/* Table showing filtered transactions with edit/delete actions */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={startEdit}
        onDelete={deleteTx}
        displayCurrency={displayCurrency}
        exchangeRates={exchangeRates}
      />

      {/* Menu to export transaction data, passing rates and currency for conversions */}
      <ExportMenu
        transactions={transactions}
        displayCurrency={displayCurrency}
        exchangeRates={exchangeRates}
      />
    </div>
  );
}
