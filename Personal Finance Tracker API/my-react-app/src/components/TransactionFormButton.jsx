import React, { useState, useEffect } from "react";
import TransactionForm from "./TransactionForm";
import { containerStyle, addButtonStyle } from "../utils/styles";

export default function TransactionFormButton({
  categories,
  onAdd,
  onUpdate,
  editingTx,
  onCancelEdit,
}) {
  // Local state to control whether the transaction form is visible
  const [showForm, setShowForm] = useState(false);

  // Handler to cancel form and hide it
  const handleCancel = () => {
    setShowForm(false);
    // If currently editing a transaction and a cancel callback exists, call it
    if (editingTx && onCancelEdit) onCancelEdit();
  };

  // If editingTx prop changes (i.e., a transaction is being edited),
  // show the form automatically
  useEffect(() => {
    if (editingTx) setShowForm(true);
  }, [editingTx]);

  return (
    <div style={containerStyle}>
      {/* Show "Add Transaction" button only when form is hidden and no transaction is being edited */}
      {!showForm && !editingTx && (
        <button
          onClick={() => setShowForm(true)} // Show form when clicked
          style={addButtonStyle}
        >
          Add Transaction
        </button>
      )}

      {/* Show the TransactionForm when showForm is true */}
      {showForm && (
        <TransactionForm
          categories={categories}
          onAdd={(tx) => {
            onAdd(tx);      // Call parent's onAdd handler
            setShowForm(false); // Hide the form after adding
          }}
          onUpdate={(tx) => {
            onUpdate(tx);      // Call parent's onUpdate handler
            setShowForm(false); // Hide the form after updating
          }}
          onCancel={handleCancel} // Pass cancel handler to the form
          editingTx={editingTx}   // Pass transaction to edit (if any)
        />
      )}
    </div>
  );
}
