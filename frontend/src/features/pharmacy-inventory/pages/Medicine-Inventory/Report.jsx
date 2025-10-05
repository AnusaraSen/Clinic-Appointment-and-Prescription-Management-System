import React, { useEffect, useState } from "react";
import { getMonthlyReport } from "../services/medicineService";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);
import "../../../../styles/Report.css";

const Report = () => {
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchReport = async (y = year, m = month) => {
    const res = await getMonthlyReport(y, m);
    setReport(res.data.summary);
  };

  useEffect(() => {
    fetchReport(year, month);
  }, []);

  if (!report) return <p>Loading report...</p>;

  // 📊 Bar Chart
  const barData = {
    labels: ["Total Medicines", "Total Quantity"],
    datasets: [
      {
        label: "Stock Summary",
        data: [report.totalMedicines, report.totalQuantity],
        backgroundColor: ["#4CAF50", "#2196F3"]
      }
    ]
  };

  // 🥧 Pie Chart
  const pieData = {
    labels: ["Normal Stock", "Low Stock", "Expired"],
    datasets: [
      {
        data: [
          report.totalMedicines - report.lowStock.length - report.expired.length,
          report.lowStock.length,
          report.expired.length
        ],
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"]
      }
    ]
  };

  return (
    <div className="report-page">
      <div className="report-card">
        <header className="report-header">
          <h2 className="report-title">📊 Monthly Report</h2>
        </header>

        <div className="report-controls">
          <select
            className="report-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            className="report-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="report-button" onClick={() => fetchReport(year, month)}>
            Load Report
          </button>
        </div>

        <div className="report-summary">
          <p><strong>Period:</strong> {report.month}</p>
          <p>Total Medicines Updated: {report.totalMedicines}</p>
          <p>Total Stock Quantity: {report.totalQuantity}</p>
          <p>⚠ Low Stock: {report.lowStock.length > 0 ? report.lowStock.join(", ") : "None"}</p>
          <p>❌ Expired: {report.expired.length > 0 ? report.expired.join(", ") : "None"}</p>
        </div>

        <div className="report-charts">
          <div className="report-chart-card">
            <h3 className="report-subtitle">📦 Stock Summary</h3>
            <Bar data={barData} />
          </div>
          <div className="report-chart-card">
            <h3 className="report-subtitle">⚠ Alerts Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
