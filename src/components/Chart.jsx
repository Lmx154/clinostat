import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Base options without dynamic x-scale and y-scale limits
const baseOptions = {
  responsive: true,
  animation: false,
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'RPM' },
      // Default max is 255; will be overridden dynamically if needed
      max: 255
    }
  },
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Live Motor RPM' }
  },
  maintainAspectRatio: false
};

// Helper to fill missing points (1 sec gaps) with interpolated values
const fillMissingPoints = (data) => {
  if (!data.length) return data;
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const filled = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diff = curr.timestamp - prev.timestamp;
    // For every missing second, insert an interpolated point
    if (diff > 1000) {
      const missingCount = Math.floor(diff / 1000) - 1;
      for (let j = 1; j <= missingCount; j++) {
        const interpolatedTime = prev.timestamp + 1000 * j;
        filled.push({
          timestamp: interpolatedTime,
          rpm1: Math.round((prev.rpm1 + curr.rpm1) / 2),
          rpm2: Math.round((prev.rpm2 + curr.rpm2) / 2)
        });
      }
    }
    filled.push(curr);
  }
  return filled;
};

export const RPMChart = ({ motorData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [motorData]);

  const currentTime = Date.now();
  const baseTime = currentTime - 10000;
  const filteredData = motorData.filter(d => d.timestamp >= currentTime - 10000);
  const filledData = fillMissingPoints(filteredData);

  // Determine dynamic maximum for y scale (at least 255)
  const dynamicYMax = Math.max(255, ...filledData.flatMap(d => [d.rpm1, d.rpm2]));

  // Format actual time ("HH:MM:SS") from value + baseTime
  const formatTime = (value) => {
    const date = new Date(value + baseTime);
    const pad = num => num.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Dynamic options with fixed x-axis from 0 to 10000 (ms)
  const dynamicOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      x: {
        type: 'linear',
        position: 'bottom',
        title: { display: true, text: 'Time' },
        min: 0,
        max: 10000,
        ticks: {
          callback: value => formatTime(value)
        }
      },
      y: {
        ...baseOptions.scales.y,
        max: dynamicYMax
      }
    }
  };

  // Transform filledData to use relative x values (in ms)
  const data = {
    datasets: [
      {
        label: 'Motor 1 RPM',
        data: filledData.map(d => ({ x: d.timestamp - baseTime, y: d.rpm1 })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 3,
        fill: false
      },
      {
        label: 'Motor 2 RPM',
        data: filledData.map(d => ({ x: d.timestamp - baseTime, y: d.rpm2 })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 3,
        fill: false
      }
    ]
  };

  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow-lg p-4">
      <Line ref={chartRef} options={dynamicOptions} data={data} />
    </div>
  );
};
