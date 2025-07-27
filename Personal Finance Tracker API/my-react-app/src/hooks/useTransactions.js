import { useEffect, useState } from "react";

export default function useTransactions() {
  // Get auth token from localStorage
  const token = localStorage.getItem("token");

  // State to store all transactions
  const [transactions, setTransactions] = useState([]);

  // State to store the transaction currently being edited
  const [editingTx, setEditingTx] = useState(null);

  // State to store filters applied: type (income/expense) and category
  const [filters, setFilters] = useState({ type: "", category: "" });

  // Fetch all transactions on mount
  useEffect(() => {
    fetch("http://localhost:8000/transactions/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTransactions)  // Set fetched transactions to state
      .catch(console.error);  // Log any errors
  }, [token]); // Depend on token in case it changes

  // Add a new transaction
  const addTx = async (tx) => {
    const res = await fetch("http://localhost:8000/transactions/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tx),
    });
    const newTx = await res.json();
    // Prepend the new transaction to the list
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Update an existing transaction (editingTx must be set)
  const updateTx = async (tx) => {
    const res = await fetch(`http://localhost:8000/transactions/${editingTx.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tx),
    });
    const updated = await res.json();
    // Replace the updated transaction in state
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    // Clear editing state
    setEditingTx(null);
  };

  // Delete a transaction by id
  const deleteTx = async (id) => {
    await fetch(`http://localhost:8000/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Remove the deleted transaction from state
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Begin editing a transaction
  const startEdit = (tx) => setEditingTx(tx);

  // Cancel editing mode
  const cancelEdit = () => setEditingTx(null);

  // Filter transactions based on filters state: type and category
  const filteredTransactions = transactions.filter((tx) => {
    const matchType = !filters.type || tx.type === filters.type;
    const matchCat = !filters.category || tx.category?.name === filters.category;
    return matchType && matchCat;
  });

  // Return state and functions to be used by components
  return {
    transactions,
    addTx,
    updateTx,
    deleteTx,
    editingTx,
    startEdit,
    cancelEdit,
    filteredTransactions,
    setFilters,
  };
}
