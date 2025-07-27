import React, { useState } from "react";
import useBudgets from "../hooks/useBudgets"; // Custom hook for fetching and managing budgets
import BudgetForm from "./BudgetForm"; // Reusable form component for creating/editing budgets
import * as styles from "../utils/styles"; // Shared styles

// Component to display a summary of budgets, allow CRUD operations
export default function BudgetSummary({ categories, transactions }) {
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets(); // Destructure budget operations
  const [editingBudget, setEditingBudget] = useState(null); // Track the budget currently being edited
  const [showForm, setShowForm] = useState(false); // Show/hide budget form

  // Show loading message while data is being fetched
  if (loading) return <p>Loading budgets...</p>;
  if (!budgets) return null; // Return nothing if no budget data is available

  // Handles saving a new or updated budget
  const handleSave = async (budgetData) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, budgetData); // Update existing budget
      } else {
        await createBudget(budgetData); // Create new budget
      }
      setShowForm(false);
      setEditingBudget(null);
    } catch {
      alert("Error saving budget, check console.");
    }
  };

  // Handles deleting a budget
  const handleDelete = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      await deleteBudget(budgetId);
    } catch {
      alert("Error deleting budget, check console.");
    }
  };

  return (
    <div style={styles.budgetSummaryContainer}>
      <h2 style={styles.budgetSummaryHeading}>Budget Summary</h2>

      {/* Show "Add Budget" button only when form is not visible */}
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBudget(null); // Clear any previous editing state
          }}
          style={styles.addBudgetButton}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.addBudgetButtonHover.backgroundColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.addBudgetButton.backgroundColor)}
        >
          Add Budget
        </button>
      )}

      {/* Conditionally render budget form for adding/editing */}
      {showForm && (
        <BudgetForm
          categories={categories}
          editingBudget={editingBudget}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      )}

      {/* Render each budget card with progress and actions */}
      <div style={styles.budgetsGrid}>
        {budgets.map((b) => {
          const category = categories.find((c) => c.id === b.category_id); // Get category info
          const categoryName = category ? category.name : "Unknown";

          // Calculate amount spent for this category
          const spent = transactions
            ? transactions.filter((t) => t.category_id === b.category_id).reduce((total, t) => total + t.amount, 0)
            : 0;

          const overspent = spent > b.amount; // Check if budget is exceeded
          const percent = Math.min((spent / b.amount) * 100, 100); // Cap progress at 100%

          return (
            <div key={b.id} style={styles.budgetCard}>
              {/* Budget header with category name and overspent label */}
              <div style={styles.budgetCardHeader}>
                <span style={styles.budgetCategoryName}>{categoryName}</span>
                {overspent && <span style={styles.overspentBadge}>Overspent!</span>}
              </div>

              {/* Progress bar for budget usage */}
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBar(percent, overspent)}></div>
              </div>

              {/* Budget amount vs spent */}
              <div style={styles.budgetSpentInfo}>
                Spent: <strong>€{spent.toFixed(2)}</strong> / <strong>€{b.amount.toFixed(2)}</strong>
              </div>

              {/* Action buttons to edit or delete budget */}
              <div style={styles.budgetCardActions}>
                <button
                  style={{ ...styles.actionButton, ...styles.editButton }}
                  onClick={() => {
                    setEditingBudget(b);
                    setShowForm(true); // Show form with data for editing
                  }}
                  aria-label={`Edit budget for ${categoryName}`}
                >
                  Edit
                </button>
                <button
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={() => handleDelete(b.id)}
                  aria-label={`Delete budget for ${categoryName}`}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
