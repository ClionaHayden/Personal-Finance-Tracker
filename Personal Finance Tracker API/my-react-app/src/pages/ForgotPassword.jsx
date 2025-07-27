import { useState } from "react";
import FormContainer from "../components/FormContainer";
import { inputStyle, forgotPasswordButtonStyle } from "../utils/styles";

export default function ForgotPassword() {
  // State to hold the user's email input
  const [email, setEmail] = useState("");
  
  // State to hold status messages (success or error) after form submission
  const [status, setStatus] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();   // Prevent default form submit behavior (page reload)
    setStatus(null);      // Clear previous status message

    try {
      // Send a POST request to the backend endpoint for password reset requests
      const res = await fetch("http://localhost:8000/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),  // Send email as JSON payload
      });

      const data = await res.json();

      // If the response is not OK, throw an error with message from backend
      if (!res.ok) {
        throw new Error(data.detail || "Reset request failed");
      }

      // If successful, set a success status message to notify user
      setStatus({ type: "success", text: "Reset link sent! Please check your email." });
    } catch (err) {
      // If any error occurs, set an error status message to notify user
      setStatus({ type: "error", text: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* FormContainer presumably renders a styled box with title and status message */}
      <FormContainer title="Forgot Password" message={status}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}  // Update email state on input change
          required                                    // Make input required
          style={inputStyle}                          // Apply custom styles
        />
        <button type="submit" style={forgotPasswordButtonStyle}>
          Send Reset Link
        </button>
      </FormContainer>
    </form>
  );
}
