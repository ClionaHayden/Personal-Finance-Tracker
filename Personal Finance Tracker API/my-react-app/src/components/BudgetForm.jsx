import React, { useState, useEffect } from "react";
// Importing styles from a utility module
import {
  budgetFormStyle,
  labelStyle,
  budgetInputStyle,
  buttonPrimary,
  buttonSecondary,
  headingStyle,
} from "../utils/styles";

// BudgetForm component allows users to create or edit a budget entry
export default function BudgetForm({ categories, onSave, onCancel, editingBudget }) {
  // Local state for selected category, amount, and month
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");

  // Effect runs when editingBudget changes (i.e., when editing an existing entry)
  useEffect(() => {
    if (editingBudget) {
      // Pre-fill the form with the existing budget's data
      setCategoryId(editingBudget.category_id);
      setAmount(editingBudget.budget_amount ?? editingBudget.amount);
      setMonth(new Date(editingBudget.month).toISOString().slice(0, 7)); // Format to "YYYY-MM"
    } else {
      // Reset form fields for new entry
      setCategoryId("");
      setAmount("");
      setMonth("");
    }
  }, [editingBudget]);

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!categoryId || !amount || !month) {
      alert("Please fill all fields");
      return;
    }
    // Convert month to full ISO date string
    const fullMonth = new Date(`${month}-01T00:00:00`).toISOString();
    // Call onSave with the formatted budget data
    onSave({ category_id: parseInt(categoryId), amount: parseFloat(amount), month: fullMonth });
  };

  // JSX for the budget form
  return (
    <form onSubmit={handleSubmit} style={budgetFormStyle}>

      {/* Category selection dropdown */}
      <label htmlFor="category" style={labelStyle}>
        Category
      </label>
      <select
        id="category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        style={budgetInputStyle}
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Amount input field */}
      <label htmlFor="amount" style={labelStyle}>
        Amount
      </label>
      <input
        id="amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={budgetInputStyle}
      />

      {/* Month input field */}
      <label htmlFor="month" style={labelStyle}>
        Month
      </label>
      <input
        id="month"
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        required
        style={budgetInputStyle}
      />

      {/* Action buttons */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button type="submit" style={buttonPrimary}>
          {editingBudget ? "Update" : "Add"} {/* Label changes based on edit mode */}
        </button>

        <button type="button" onClick={onCancel} style={buttonSecondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}
