// src/components/FormContainer.jsx
import React from "react";
// Import shared styles
import * as styles from "../utils/styles";

// A reusable wrapper component for forms with optional title and message display
export default function FormContainer({ title, children, message }) {
  return (
    <div style={styles.formContainerStyle}>
      {/* Optional form title */}
      {title && <h2 style={styles.formContainerTitle}>{title}</h2>}

      {/* Render form content passed as children */}
      {children}

      {/* Optional status message (e.g., success or error) */}
      {message && (
        <p style={styles.formMessageStyle(message.type)}>
          {message.text}
        </p>
      )}
    </div>
  );
}
