import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { universityWiseData } from '@/data/mockData';

const COLORS = ['hsl(226, 70%, 45%)', 'hsl(262, 83%, 58%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)'];

export const UniversityPieChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-slide-up">
      <h3 className="font-semibold text-card-foreground mb-4">University Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={universityWiseData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="referrals"
            >
              {universityWiseData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [`${value} referrals`, name]}
            />
            <Legend
              formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
