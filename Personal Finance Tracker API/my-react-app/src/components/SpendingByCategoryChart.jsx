import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { pieChartContainerStyle } from "../utils/styles";

// Color palette for pie chart segments
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A28EFF", "#FF6384", "#36A2EB", "#FFCE56",
];

// Displays a pie chart of total expenses grouped by category
export default function SpendingByCategoryChart({ categories, transactions }) {
  // Aggregate spending per category (only include categories with expenses > 0)
  const data = categories
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.category_id === cat.id && t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { name: cat.name, value: spent };
    })
    .filter((d) => d.value > 0); // Exclude categories with no expenses

  return (
    <div style={pieChartContainerStyle}>
      <PieChart width={400} height={300}>
        {/* Main pie rendering total spent per category */}
        <Pie
          data={data}
          dataKey="value"    // Determines pie slice size
          nameKey="name"     // Used for labels and legend
          cx="50%"           // Center X
          cy="50%"           // Center Y
          outerRadius={100}  // Pie radius
          fill="#8884d8"
          label              // Enable slice labels
        >
          {/* Assign each slice a unique color */}
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* Show tooltip on hover */}
        <Tooltip />
        {/* Show category names in legend */}
        <Legend />
      </PieChart>
    </div>
  );
}
