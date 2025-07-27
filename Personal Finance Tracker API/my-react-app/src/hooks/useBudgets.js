import { useState, useEffect } from "react";
import useAuth from "./useAuth";

export default function useBudgets() {
  // Get user, token, and ready state from auth hook
  const { user, token, ready } = useAuth();

  // Local state for budgets data and loading status
  const [budgets, setBudgets] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch budgets from backend API
  async function fetchBudgets() {
    // If no user or token, clear budgets and stop loading
    if (!user || !token) {
      setBudgets(null);
      setLoading(false);
      return;
    }

    setLoading(true); // Start loading

    try {
      // (Optional) Prepare a date param if needed in future requests
      const now = new Date();
      const monthParam = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01T00:00:00`;

      // Call API to get budgets, pass Authorization header with token
      const res = await fetch(`http://localhost:8000/budgets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Throw error if response not ok
      if (!res.ok) throw new Error("Failed to fetch budgets");

      // Parse JSON data and update budgets state
      const data = await res.json();
      console.log("Fetched budgets:", data);
      setBudgets(data);
    } catch (error) {
      // On error, log it and clear budgets
      console.error(error);
      setBudgets(null);
    } finally {
      // Stop loading no matter what
      setLoading(false);
    }
  }

  // Effect to fetch budgets once auth is ready and user/token are available
  useEffect(() => {
    if (!ready) return;
    fetchBudgets();
  }, [user, token, ready]);

  // Create a new budget via POST request
  async function createBudget(budget) {
    try {
      const res = await fetch("http://localhost:8000/budgets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budget),
      });
      if (!res.ok) throw new Error("Failed to create budget");

      // Refresh budgets list after creation
      await fetchBudgets();
    } catch (err) {
      console.error(err);
      throw err; // Let caller handle error if needed
    }
  }

  // Update an existing budget by ID via PUT request
  async function updateBudget(id, budget) {
    try {
      const res = await fetch(`http://localhost:8000/budgets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budget),
      });
      if (!res.ok) throw new Error("Failed to update budget");

      // Refresh budgets list after update
      await fetchBudgets();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Delete a budget by ID via DELETE request
  async function deleteBudget(id) {
    try {
      const res = await fetch(`http://localhost:8000/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete budget");

      // Refresh budgets list after deletion
      await fetchBudgets();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // Return budgets data, loading state, CRUD functions, and refresh function
  return {
    budgets,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets: fetchBudgets,
  };
}
