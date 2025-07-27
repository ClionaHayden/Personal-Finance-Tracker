import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";

export default function ResetPassword() {
  // Extract query parameters from the URL, specifically the reset token
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate(); // For redirecting user after reset

  // Local state for new password inputs and messages
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null); // Success message
  const [error, setError] = useState(null); // Error message
  const [loading, setLoading] = useState(false); // Loading state for button disable

  // Handle the form submission for password reset
  const handleReset = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setMessage(null);

    // Client-side validation: check if passwords match
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true); // Indicate loading state while waiting for server response

    try {
      // Send POST request to backend with token and new password
      const res = await fetch("http://localhost:8000/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();

      // Handle errors returned by backend, including detailed validation errors
      if (!res.ok) {
        if (Array.isArray(data.detail)) {
          // Extract specific password validation error if present
          const msg = data.detail.find((d) => d.loc.includes("new_password"))?.msg;
          throw new Error(msg || "Reset failed");
        }
        throw new Error(data.detail || "Reset failed");
      }

      // If successful, set success message and redirect to login after 3 seconds
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      // Display any caught errors
      setError(err.message);
    } finally {
      // Always clear loading state after request completes
      setLoading(false);
    }
  };

  // Inline styles for inputs and button (can be moved to a shared styles file)
  const inputStyle = {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "12px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    backgroundColor: loading ? "#ccc" : "#007bff",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <form onSubmit={handleReset}>
      {/* Form container displays the form title and any success/error messages */}
      <FormContainer
        title="Reset Password"
        message={
          message
            ? { type: "success", text: message }
            : error
            ? { type: "error", text: error }
            : null
        }
      >
        {/* Input for the new password */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={inputStyle}
          disabled={loading} // Disable input while loading
        />

        {/* Input to confirm the new password */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={inputStyle}
          disabled={loading} // Disable input while loading
        />

        {/* Submit button - shows loading text and disables while request is in progress */}
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </FormContainer>
    </form>
  );
}
