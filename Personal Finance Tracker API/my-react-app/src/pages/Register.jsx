import { useState } from "react";
import FormContainer from "../components/FormContainer";
import { RegisterInputStyle, registerButtonStyle } from "../utils/styles";

export default function Register() {
  // State to track user inputs and messages
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  // Handle form submission for registration
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload on form submit
    setMessage(null);    // Clear previous messages

    try {
      // Send POST request to registration endpoint
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      // If server response indicates failure, show error message
      if (!res.ok) {
        setMessage({ type: "error", text: data.detail || "Registration failed" });
        return;
      }

      // On success, show success message
      setMessage({ type: "success", text: "User registered successfully!" });
    } catch (err) {
      // Handle network errors or other unexpected issues
      setMessage({ type: "error", text: "Network error" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* FormContainer wraps the form with consistent styling and displays messages */}
      <FormContainer title="Register" message={message}>
        
        {/* Controlled input for email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={RegisterInputStyle}
        />

        {/* Controlled input for username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={RegisterInputStyle}
        />

        {/* Controlled input for password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={RegisterInputStyle}
        />

        {/* Submit button */}
        <button type="submit" style={registerButtonStyle}>Register</button>
      </FormContainer>
    </form>
  );
}
