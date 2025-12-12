import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { universityWiseData } from '@/data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2, TrendingUp } from 'lucide-react';

const COLORS = [
  'hsl(168 80% 35%)',  // Primary teal
  'hsl(280 65% 55%)',  // Accent purple
  'hsl(158 65% 40%)',  // Success green
  'hsl(35 95% 55%)',   // Warning amber
];

export const UniversityPieChart = () => {
  const totalReferrals = universityWiseData.reduce((sum, item) => sum + item.referrals, 0);

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up">
      <CardHeader className="pb-2 bg-gradient-to-r from-accent/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">University Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Referrals by institution</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-52 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={universityWiseData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="referrals"
                nameKey="name"
                stroke="none"
              >
                {universityWiseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                }}
                formatter={(value: number) => [`${value} referrals`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center stat - positioned inside the chart container */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-3xl font-display text-foreground">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground font-medium">Total</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
          {universityWiseData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2 group cursor-pointer">
              <div 
                className="w-3 h-3 rounded-full transition-transform group-hover:scale-125"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{entry.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{entry.referrals} refs</span>
                  <span className="text-[10px] text-success flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {Math.round((entry.admissions / entry.referrals) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
