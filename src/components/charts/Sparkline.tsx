import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineProps {
  data: number[];
  colorClassName?: string; // tailwind class for stroke color
  height?: number;
}

// Minimal sparkline for inline trends
export const Sparkline: React.FC<SparklineProps> = ({ data, colorClassName = 'stroke-[hsl(var(--primary))]', height = 28 }) => {
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            dot={false}
            strokeWidth={2}
            className={colorClassName}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
