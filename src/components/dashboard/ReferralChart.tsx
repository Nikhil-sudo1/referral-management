import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { monthlyReferralData } from '@/data/mockData';

export const ReferralChart = () => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 animate-slide-up">
      <h3 className="font-semibold text-card-foreground mb-6">Referral Trends</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyReferralData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(226, 70%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(226, 70%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="referrals"
              stroke="hsl(226, 70%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReferrals)"
              name="Referrals"
            />
            <Area
              type="monotone"
              dataKey="admissions"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAdmissions)"
              name="Admissions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
