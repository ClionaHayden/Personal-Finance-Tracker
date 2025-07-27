import React, { useState, useEffect } from "react";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import RecurringFields from "./RecurringFields";
import { transactionFormStyle, transactionInputStyle, transactionButtonStyle } from "../utils/styles";
import { convertCurrency } from "../utils/currencyUtils";
import { getExchangeRates } from "../utils/exchangeRates";

export default function TransactionForm({
  editingTx,
  categories,
  onAdd,
  onUpdate,
  onCancel,
}) {
  // State variables to hold form input values
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("expense");
  const [isRecurring, setIsRecurring] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [recurringInterval, setRecurringInterval] = useState("monthly");
  const [currency, setCurrency] = useState("EUR"); // input currency
  const [exchangeRates, setExchangeRates] = useState(null); // fetched exchange rates
  const [loadingRates, setLoadingRates] = useState(true); // loading indicator for exchange rates

  // Load exchange rates and populate form fields when component mounts or editingTx changes
  useEffect(() => {
    // Fetch exchange rates asynchronously
    getExchangeRates()
      .then((rates) => {
        setExchangeRates(rates);
      })
      .catch((err) => {
        console.error("Failed to fetch exchange rates:", err);
      })
      .finally(() => setLoadingRates(false)); // mark loading as finished

    // If editing an existing transaction, populate the form with its values
    if (editingTx) {
      setAmount(editingTx.amount);
      setDescription(editingTx.description);
      setDate(editingTx.date.split("T")[0]); // Extract date part only (YYYY-MM-DD)
      setCategoryId(editingTx.category_id);
      setType(editingTx.type);
      setIsRecurring(editingTx.isRecurring || false);
      setEndDate(editingTx.endDate || "");
      setRecurringInterval(editingTx.recurringInterval || "monthly");
      setCurrency(editingTx.currency || "EUR");
    } else {
      // Reset form fields for adding a new transaction
      setAmount("");
      setDescription("");
      setDate("");
      setCategoryId("");
      setType("expense");
      setIsRecurring(false);
      setEndDate("");
      setRecurringInterval("monthly");
      setCurrency("EUR");
    }
  }, [editingTx]);

  // Handler for form submission (add or update transaction)
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if exchange rates are not loaded yet
    if (!exchangeRates) {
      return alert("Exchange rates not loaded. Try again in a moment.");
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return alert("Invalid amount");

    // Convert input amount from selected currency to EUR for consistent backend storage
    const amountInEUR = convertCurrency(amountNum, currency, "EUR", exchangeRates);

    const start = new Date(date);
    const end = new Date(endDate);
    const transactions = [];

    // Base transaction object common to all created transactions
    const baseTx = {
      amount: amountInEUR,
      description,
      category_id: categoryId,
      type,
      currency: "EUR", // storing EUR as canonical currency in backend
    };

    if (isRecurring) {
      // For recurring transactions, create multiple transaction entries spaced by the selected interval
      let current = new Date(start);

      while (current <= end) {
        transactions.push({
          ...baseTx,
          date: current.toISOString().split("T")[0], // date string YYYY-MM-DD
          isRecurring: true,
          recurringInterval,
          endDate,
        });

        // Increment the date based on the selected recurring interval
        switch (recurringInterval) {
          case "daily":
            current = addDays(current, 1);
            break;
          case "weekly":
            current = addWeeks(current, 1);
            break;
          case "monthly":
            current = addMonths(current, 1);
            break;
          case "yearly":
            current = addYears(current, 1);
            break;
          default:
            current = addMonths(current, 1);
        }
      }
    } else {
      // For one-time transactions, just add a single entry
      transactions.push({
        ...baseTx,
        date,
        isRecurring: false,
      });
    }

    // Call the appropriate parent handler depending on if we're editing or adding
    if (editingTx) {
      // Update uses only the first transaction (no bulk updates for recurring editing)
      onUpdate(transactions[0]);
    } else {
      // Add each transaction separately (to support recurring transactions)
      transactions.forEach(onAdd);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={transactionFormStyle}>
      {/* Amount input */}
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
        style={transactionInputStyle}
      />

      {/* Currency selector only shown when adding a new transaction */}
      {!editingTx && (
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={transactionInputStyle}
        >
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
        </select>
      )}

      {/* Description input */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
        style={transactionInputStyle}
      />

      {/* Date input */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={transactionInputStyle}
      />

      {/* Category selector */}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        style={transactionInputStyle}
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Type selector (expense/income) */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={transactionInputStyle}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      {/* Recurring transaction related inputs */}
      <RecurringFields
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        recurringInterval={recurringInterval}
        setRecurringInterval={setRecurringInterval}
        endDate={endDate}
        setEndDate={setEndDate}
        inputStyle={transactionInputStyle}
      />

      {/* Submit button with different styles based on add or edit */}
      <button
        type="submit"
        style={{
          ...transactionButtonStyle,
          backgroundColor: editingTx ? "#4caf50" : "#2196f3",
          color: "#fff",
        }}
      >
        {editingTx ? "Update" : "Add"} Transaction
      </button>

      {/* Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        style={{
          ...transactionButtonStyle,
          backgroundColor: "#f44336",
          color: "#fff",
        }}
      >
        Cancel
      </button>
    </form>
  );
}
