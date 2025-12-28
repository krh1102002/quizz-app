import React from 'react';
import {
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

const ChartViewer = ({ data, type, title }) => {
  if (!data) return null;

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        // For Bar Charts, we need to determine the data keys (excluding the first column which is usually the 'name')
        const barKeys = Object.keys(data[0] || {}).filter(key => key !== Object.keys(data[0] || {})[0]);
        const xAxisKey = Object.keys(data[0] || {})[0];

        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {barKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        const lineKeys = Object.keys(data[0] || {}).filter(key => key !== Object.keys(data[0] || {})[0]);
        const lineXAxisKey = Object.keys(data[0] || {})[0];

        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={lineXAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {lineKeys.map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'table':
        const tableHeaders = Object.keys(data[0] || {});
        return (
          <div className="chart-table-container">
            <table className="chart-table">
              <thead>
                <tr>
                  {tableHeaders.map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {tableHeaders.map(h => <td key={h}>{row[h]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chart-viewer">
      {title && <h4 className="chart-title">{title}</h4>}
      {renderChart()}
    </div>
  );
};

export default ChartViewer;
