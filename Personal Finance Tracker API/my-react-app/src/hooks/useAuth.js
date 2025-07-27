import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

export default function useAuth() {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [user, setUser] = useState(null); // Stores current user info
  const [loading, setLoading] = useState(true); // Indicates if user data is loading
  const [ready, setReady] = useState(false); // Indicates if auth check is done
  const token = localStorage.getItem("token"); // JWT token from local storage

  useEffect(() => {
    // Function to fetch user info from backend using token
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }, // Auth header with token
        });

        if (!res.ok) throw new Error("Failed to fetch user"); // Handle error

        const data = await res.json(); // Parse response JSON
        setUser(data); // Save user data in state
      } catch (err) {
        console.error(err);
        setUser(null); // Clear user state on error
      } finally {
        setLoading(false); // Loading finished
        setReady(true);    // Auth check finished
      }
    }

    // If token exists, fetch user info, else just mark loading finished
    if (token) fetchUser();
    else {
      setLoading(false);
      setReady(true);
    }
  }, [token]); // Re-run effect when token changes

  // Logout function clears token, user state, and redirects to home
  const logout = () => {
    localStorage.removeItem("token");  // Remove token from storage
    setUser(null);                      // Clear user data
    navigate("/");                      // Redirect to home or login page
  };

  // Return user info, auth states, token, and logout function
  return { user, token, loading, ready, logout };
}
