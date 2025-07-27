import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { loginInputStyle, loginButtonStyle, linkContainerStyle, registerLinkStyle } from "../utils/styles";

export default function Login() {
  // Hook to programmatically navigate between routes
  const navigate = useNavigate();

  // State variables to track email, password input, and error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();   // Prevent page reload on form submit
    setError(null);       // Clear previous errors

    try {
      // Send POST request to login endpoint with email and password
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // If response is not OK, parse error message and set error state
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.detail || "Login failed");
        return;
      }

      // Parse successful response data
      const data = await res.json();

      // Store JWT token in localStorage for authenticated requests
      localStorage.setItem("token", data.access_token);

      // Redirect user to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      // If network error or other failure, set generic error message
      setError("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 
        FormContainer is assumed to provide styling and layout 
        Passes an error message if there is one to display it
      */}
      <FormContainer title="Login" message={error ? { type: "error", text: error } : null}>
        
        {/* Controlled input for email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={loginInputStyle}
        />

        {/* Controlled input for password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={loginInputStyle}
        />

        {/* Submit button */}
        <button type="submit" style={loginButtonStyle}>Login</button>

        {/* Link to forgot password page */}
        <p style={linkContainerStyle}>
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>

        {/* Link to registration page for new users */}
        <p style={{ textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" style={registerLinkStyle}>
            Register here
          </Link>
        </p>
      </FormContainer>
    </form>
  );
}
