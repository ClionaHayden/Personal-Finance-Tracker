// src/hooks/useCategories.js
import { useEffect, useState } from "react";

export default function useCategories() {
  // State to hold the list of categories
  const [categories, setCategories] = useState([]);

  // State to track loading status of the fetch request
  const [loading, setLoading] = useState(true);

  // Retrieve token from localStorage for API authentication
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Async function to fetch categories from backend
    async function fetchCategories() {
      try {
        // Make GET request to /categories with Authorization header
        const res = await fetch("http://localhost:8000/categories/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If response is not ok, throw an error to be caught below
        if (!res.ok) throw new Error("Failed to fetch categories");

        // Parse JSON response and update categories state
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        // Log error and reset categories to empty array on failure
        console.error("Error loading categories:", err);
        setCategories([]);
      } finally {
        // Mark loading as complete regardless of success/failure
        setLoading(false);
      }
    }

    // Trigger fetchCategories on component mount or when token changes
    fetchCategories();
  }, [token]);

  // Return categories data and loading status to consumers of the hook
  return { categories, loading };
}
