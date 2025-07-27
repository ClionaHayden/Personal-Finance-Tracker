// Header.jsx
import React from "react";
// Import shared header and button styles
import { headerStyle, logoutButtonStyle } from "../utils/styles";

// Header component displaying user's name and a logout button
export default function Header({ user, onLogout }) {
  // Change button color on hover (mouse enter)
  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = "#d32f2f";
  };

  // Revert button color on mouse leave
  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = "#f44336";
  };

  return (
    <header style={headerStyle}>
      {/* Greeting with the username */}
      <h2>Welcome, {user.username}</h2>

      {/* Logout button with hover effects and accessible label */}
      <button
        onClick={onLogout}
        style={logoutButtonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Logout"
      >
        Logout
      </button>
    </header>
  );
}
