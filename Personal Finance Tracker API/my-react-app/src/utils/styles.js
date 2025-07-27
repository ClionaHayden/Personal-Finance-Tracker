// styles.js

// For TransactionForm
export const transactionFormStyle  = {
  display: "flex",
  flexDirection: "column",
  maxWidth: 400,
  margin: "20px auto",
  gap: 12,
  padding: 16,
  border: "1px solid #ccc",
  borderRadius: 8,
  backgroundColor: "#fafafa",
};

export const transactionInputStyle  = {
  padding: 8,
  fontSize: "1rem",
  borderRadius: 4,
  border: "1px solid #ccc",
};

export const transactionButtonStyle  = {
  padding: 10,
  fontSize: "1rem",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
};

// For BudgetForm 
export const budgetFormStyle = {
  background: "#fff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  maxWidth: 400,
  margin: "0 auto 32px",
  fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  border: "1px solid #ccc",
};

export const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: "600",
  color: "#333",
};

export const budgetInputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  marginBottom: 16,
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export const buttonPrimary = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  backgroundColor: "#3498db",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  marginRight: 12,
  transition: "background-color 0.2s ease",
};

export const buttonSecondary = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  backgroundColor: "#ff2e2eff",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

export const headingStyle = {
  marginBottom: 24,
  color: "#222",
  fontWeight: "700",
  fontSize: 22,
  textAlign: "center",
};

// BudgetSummary.jsx

export const budgetSummaryContainer = {
  padding: 20,
  fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
};

export const budgetSummaryHeading = {
  fontSize: 24,
  fontWeight: "700",
  marginBottom: 20,
  textAlign: "center",
  color: "#333",
};

export const addBudgetButton = {
  marginBottom: 20,
  padding: "10px 20px",
  backgroundColor: "#3498db",
  color: "#fff",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  alignSelf: "center",
  display: "block",
  transition: "background-color 0.2s",
};

export const addBudgetButtonHover = {
  backgroundColor: "#2980b9",
};

export const budgetsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

export const budgetCard = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  padding: 20,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export const budgetCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const budgetCategoryName = {
  fontWeight: "700",
  fontSize: 18,
  color: "#222",
};

export const overspentBadge = {
  color: "#e74c3c",
  fontWeight: "700",
  fontSize: 14,
  backgroundColor: "#fdecea",
  padding: "2px 8px",
  borderRadius: 8,
};

export const progressBarContainer = {
  background: "#e0e0e0",
  borderRadius: 8,
  height: 12,
  overflow: "hidden",
};

export const progressBar = (percent, overspent) => ({
  height: "100%",
  width: `${percent}%`,
  backgroundColor: overspent ? "#e74c3c" : "#27ae60",
  borderRadius: 8,
  transition: "width 0.3s ease-in-out",
});

export const budgetSpentInfo = {
  fontSize: 14,
  color: "#555",
};

export const budgetCardActions = {
  position: "absolute",
  top: 16,
  right: 16,
  display: "flex",
  gap: 10,
};

export const actionButton = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontWeight: "600",
  padding: "4px 8px",
};

export const editButton = {
  color: "#2980b9",
};

export const deleteButton = {
  color: "#e74c3c",
};

// FormContainer.jsx

export const formContainerStyle = {
  maxWidth: "400px",
  margin: "60px auto",
  padding: "30px",
  background: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

export const formContainerTitle = {
  textAlign: "center",
  color: "#333",
};

export const formMessageStyle = (type) => ({
  textAlign: "center",
  color: type === "error" ? "red" : "green",
});

// Header.jsx

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  backgroundColor: "#2196f3",
  color: "#fff",
  borderRadius: "0 0 8px 8px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

export const logoutButtonStyle = {
  backgroundColor: "#f44336",
  border: "none",
  color: "white",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s ease",
};

// MonthlySpendChart.jsx

export const chartContainerStyle = {
  width: "100%",
  height: 400,
};

// SpendingByCategoryChart.jsx
export const pieChartContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "20px auto",
};

// ToggleGraphsButton.jsx
export const toggleButtonStyle = {
  margin: "20px auto",
  padding: "10px 20px",
  backgroundColor: "#3498db",
  color: "#fff",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background-color 0.2s",
  display: "block",
};

export const graphsContainerStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: 20,
  paddingLeft: 20,
};

export const spendingChartWrapperStyle = {
  width: 500,
};

export const monthlyChartWrapperStyle = {
  width: 700,
};

// TransactionFormButton.jsx
export const containerStyle = {
  textAlign: "left",
  margin: "20px",
};

export const addButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
};

// TransactionTable.jsx
export const tableStyle = {
  width: "90%",
  maxWidth: "900px",
  margin: "20px auto",
  borderCollapse: "collapse",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

export const thTdStyle = {
  border: "1px solid #ddd",
  padding: "12px 15px",
  textAlign: "left",
};

export const transactionTableHeaderStyle = {
  backgroundColor: "#2196f3",
  color: "white",
};

export const buttonStyle = {
  marginRight: "8px",
  padding: "6px 12px",
  fontSize: "0.9rem",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
};

export const rowStyle = {
  borderBottom: "1px solid #ddd",
};

export const capitalizeText = {
  textTransform: "capitalize",
};

export const paginationContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "1rem",
  marginTop: "1rem",
};

export const paginationButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#2196f3",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};

// ForgotPassword.jsx
export const inputStyle = {
  padding: "10px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

export const forgotPasswordButtonStyle = {
  padding: "12px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2196f3",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

// Login.jsx
export const loginInputStyle = {
  padding: "10px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

export const loginButtonStyle = {
  padding: "12px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2196f3",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

export const linkContainerStyle = {
  marginTop: "10px",
  textAlign: "center",
};

export const registerLinkStyle = {
  color: "blue",
  textDecoration: "underline",
};

// Register.jsx
export const RegisterInputStyle = {
  padding: "10px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

export const RegisterButtonStyle = {
  padding: "12px",
  fontSize: "1rem",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

export const RegisterLoginButtonStyle = {
  ...RegisterButtonStyle,
  backgroundColor: "#2196f3",
  color: "white",
};

export const registerButtonStyle = {
  ...RegisterButtonStyle,
  backgroundColor: "#28a745",
  color: "white",
};

// ExportMenu.jsx

export const exportButtonStyle = {
  backgroundColor: "#2196f3",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "4px",
  cursor: "pointer",
};

export const exportContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  marginTop: "1rem",
};


