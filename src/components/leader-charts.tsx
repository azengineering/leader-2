'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartTooltipContent } from "@/components/ui/chart";

interface ChartData {
  name: string;
  value: number;
  rating?: number; // For rating distribution
  color?: string; // For election performance
}

interface LeaderChartsProps {
  ratingChartData: ChartData[];
  socialChartData: ChartData[];
  electionPerformanceData: ChartData[] | null;
  ratingChartConfig: ChartConfig;
  socialChartConfig: ChartConfig;
  RATING_COLORS: { [key: string]: string };
  SOCIAL_BEHAVIOUR_COLORS: { [key: string]: string };
}

const LeaderCharts: React.FC<LeaderChartsProps> = ({
  ratingChartData,
  socialChartData,
  electionPerformanceData,
  ratingChartConfig,
  socialChartConfig,
  RATING_COLORS,
  SOCIAL_BEHAVIOUR_COLORS,
}) => {
  return (
    <>
      {ratingChartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={ratingChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2}>
              {ratingChartData.map((entry) => (
                <Cell key={entry.name} fill={RATING_COLORS[String(entry.rating)]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {socialChartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={socialChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={2}>
              {socialChartData.map((entry) => (
                <Cell key={entry.name} fill={SOCIAL_BEHAVIOUR_COLORS[entry.name] || '#a8a29e'} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}

      {electionPerformanceData && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={electionPerformanceData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
            >
              {electionPerformanceData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={{ fill: 'hsla(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                borderRadius: 'var(--radius)',
                border: '1px solid hsl(var(--border))'
              }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default LeaderCharts;
