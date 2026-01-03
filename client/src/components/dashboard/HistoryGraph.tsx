import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStatsHistory } from '../../hooks/useStats';

const timeRanges = [
  { label: '24H', hours: 24 },
  { label: '7D', hours: 24 * 7 },
  { label: '30D', hours: 24 * 30 },
];

export const HistoryGraph = () => {
  const [selectedRange, setSelectedRange] = useState(24);
  const { history, loading } = useStatsHistory(selectedRange);

  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    cpu: h.cpu_usage,
    memory: (h.memory_used / h.memory_total) * 100,
    temp: h.cpu_temp,
  }));

  // Sample data if too many points
  const sampledData =
    chartData.length > 100
      ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 100) === 0)
      : chartData;

  return (
    <motion.div
      className="terminal-box p-4 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-primary">
          SYSTEM HISTORY
        </h3>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.hours}
              onClick={() => setSelectedRange(range.hours)}
              className={`px-3 py-1 text-xs border transition-all ${
                selectedRange === range.hours
                  ? 'bg-terminal-primary/10 border-terminal-primary text-terminal-primary'
                  : 'border-terminal-border text-terminal-muted hover:border-terminal-primary-dim'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="loading-spinner w-8 h-8" />
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampledData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#002200" />
              <XAxis
                dataKey="time"
                stroke="#336633"
                tick={{ fill: '#336633', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#336633"
                tick={{ fill: '#336633', fontSize: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #003300',
                  borderRadius: '4px',
                }}
                labelStyle={{ color: '#00ff00' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span style={{ color: '#33ff33', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU %"
                stroke="#00ff00"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="RAM %"
                stroke="#33ffff"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="temp"
                name="Temp °C"
                stroke="#ffb000"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};
