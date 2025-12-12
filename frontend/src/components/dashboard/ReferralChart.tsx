import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { monthlyReferralData } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ReferralChart = () => {
  const totalReferrals = monthlyReferralData.reduce((sum, item) => sum + item.referrals, 0);
  const totalAdmissions = monthlyReferralData.reduce((sum, item) => sum + item.admissions, 0);

  return (
    <Card className="card-elevated overflow-hidden animate-slide-up">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Referral Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly performance overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-display text-foreground">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </div>
            <Badge className="bg-success/10 text-success border-0 font-semibold">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyReferralData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168 80% 35%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(168 80% 35%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(158 65% 40%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(158 65% 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="referrals"
                stroke="hsl(168 80% 35%)"
                strokeWidth={3}
                fill="url(#colorReferrals)"
                name="Referrals"
              />
              <Area
                type="monotone"
                dataKey="admissions"
                stroke="hsl(158 65% 40%)"
                strokeWidth={3}
                fill="url(#colorAdmissions)"
                name="Admissions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">Referrals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">Admissions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
