
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryData } from '../types';

interface CategoryChartProps {
  data: CategoryData[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="category" type="category" stroke="#94a3b8" width={120} tick={{ fill: '#cbd5e1' }} />
          <Tooltip 
            cursor={{fill: 'rgba(71, 85, 105, 0.5)'}}
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              color: '#f1f5f9'
            }}
          />
          <Legend formatter={(value) => <span style={{ color: '#e2e8f0' }}>{value}</span>} />
          <Bar dataKey="activities" name="Aktivite Sayısı" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
