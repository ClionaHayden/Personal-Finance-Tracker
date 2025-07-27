// src/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

/**
 * A wrapper component to protect routes that require authentication.
 * It checks for the presence of a token in localStorage.
 * If no token is found, it redirects the user to the home/login page.
 *
 * @param {React.ReactNode} children - The component(s) to render if authenticated.
 * @returns {React.ReactNode} - Either the children or a redirect component.
 */
export default function PrivateRoute({ children }) {
  // Retrieve authentication token from localStorage
  const token = localStorage.getItem("token");

  // If token doesn't exist, redirect to home (or login) page
  if (!token) {
    // Replace history entry to avoid back navigation to protected page
    return <Navigate to="/" replace />;
  }

  // If token exists, render the wrapped child components
  return children;
}
