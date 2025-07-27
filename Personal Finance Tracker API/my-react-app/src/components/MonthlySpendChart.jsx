import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartContainerStyle } from "../utils/styles";

// Main component that renders a line chart of monthly spending by category
export default function MonthlySpendChart({ transactions, categories }) {
  // Prepare chart data based on transaction history and category mapping
  const data = prepareMonthlySpendData(transactions, categories);
  const categoryNames = categories.map((c) => c.name);

  return (
    <div style={chartContainerStyle}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {/* X-axis shows the month */}
          <XAxis dataKey="month" />
          {/* Y-axis shows the spending amount */}
          <YAxis />
          {/* Tooltip shows values on hover */}
          <Tooltip />
          {/* Legend shows category names */}
          <Legend />
          {/* Render a separate line for each category */}
          {categoryNames.map((name, idx) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={getColor(idx)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Converts raw transaction data into monthly totals per category
function prepareMonthlySpendData(transactions, categories) {
  const monthlyDataMap = {};

  transactions.forEach(({ category_id, amount, date }) => {
    const month = new Date(date).toISOString().slice(0, 7); // e.g. "2025-07"
    const category = categories.find(c => c.id === category_id);
    if (!category) return;

    if (!monthlyDataMap[month]) monthlyDataMap[month] = {};
    monthlyDataMap[month][category.name] =
      (monthlyDataMap[month][category.name] || 0) + amount;
  });

  const months = Object.keys(monthlyDataMap).sort();

  // Convert data into array format Recharts expects
  return months.map((month) => {
    const entry = { month };
    categories.forEach((cat) => {
      entry[cat.name] = monthlyDataMap[month][cat.name] || 0;
    });
    return entry;
  });
}

// Simple utility to assign distinct colors to lines
function getColor(idx) {
  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
    "#A28EFF", "#FF6384", "#36A2EB", "#FFCE56",
  ];
  return COLORS[idx % COLORS.length];
}
