import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { rewards, referrals, counselors } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, CheckCircle, Clock, Gift, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-info/10 text-info border-info/20',
  disbursed: 'bg-success/10 text-success border-success/20',
};

const Rewards = () => {
  const [rewardsList, setRewardsList] = useState(rewards);
  
  const pendingRewards = rewardsList.filter((r) => r.status === 'pending');
  const totalPending = pendingRewards.reduce((sum, r) => sum + r.amount, 0);
  const totalDisbursed = rewardsList.filter((r) => r.status === 'disbursed').reduce((sum, r) => sum + r.amount, 0);
  const avgReward = rewardsList.length > 0 
    ? Math.round(rewardsList.reduce((sum, r) => sum + r.amount, 0) / rewardsList.length)
    : 0;

  // Get recipient name based on userType and userId
  const getRecipientName = (reward: typeof rewards[0]) => {
    const referral = referrals.find((r) => r.id === reward.referralId);
    if (reward.userType === 'referrer' && referral) {
      return referral.referrerName;
    } else if (reward.userType === 'counselor') {
      const counselor = counselors.find((c) => c.id === reward.userId);
      return counselor?.name || `Counselor ${reward.userId}`;
    }
    return `${reward.userType} ${reward.userId}`;
  };

  const handleApprove = (rewardId: string) => {
    setRewardsList((prev) =>
      prev.map((r) =>
        r.id === rewardId
          ? { ...r, status: 'approved' as const, approvedAt: new Date() }
          : r
      )
    );
    toast({
      title: 'Reward Approved',
      description: 'The reward has been approved and queued for disbursement.',
    });
  };

  const handleDisburse = (rewardId: string) => {
    setRewardsList((prev) =>
      prev.map((r) =>
        r.id === rewardId
          ? { ...r, status: 'disbursed' as const, disbursedAt: new Date() }
          : r
      )
    );
    toast({
      title: 'Reward Disbursed',
      description: 'The reward has been successfully disbursed.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rewards Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage reward distributions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold text-card-foreground">₹{totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disbursed This Month</p>
                  <p className="text-2xl font-bold text-card-foreground">₹{totalDisbursed.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-card-foreground">{rewardsList.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Reward</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    ₹{avgReward.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingRewards.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader className="bg-warning/5 border-b border-warning/20">
              <CardTitle className="flex items-center gap-2 text-warning">
                <Clock className="w-5 h-5" />
                Pending Approvals ({pendingRewards.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {pendingRewards.map((reward) => {
                  const referral = referrals.find((r) => r.id === reward.referralId);
                  return (
                    <div key={reward.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Award className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {getRecipientName(reward)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reward.userType.charAt(0).toUpperCase() + reward.userType.slice(1)} • Referral: {referral?.referralCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-card-foreground">₹{reward.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground capitalize">{reward.rewardType}</p>
                        </div>
                        <Button size="sm" onClick={() => handleApprove(reward.id)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Rewards Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Rewards</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Referral</TableHead>
                  <TableHead>Recipient Type</TableHead>
                  <TableHead>Reward Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-card-foreground mb-2">No Rewards Found</h3>
                      <p className="text-muted-foreground">No reward records available at this time.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rewardsList.map((reward) => {
                    const referral = referrals.find((r) => r.id === reward.referralId);
                    return (
                      <TableRow key={reward.id}>
                        <TableCell className="font-mono text-sm text-primary">
                          {referral?.referralCode || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-card-foreground capitalize">{getRecipientName(reward)}</p>
                            <p className="text-xs text-muted-foreground capitalize">{reward.userType}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{reward.rewardType}</TableCell>
                        <TableCell className="font-medium">₹{reward.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn('capitalize', statusStyles[reward.status])}>
                              {reward.status}
                            </Badge>
                            {reward.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDisburse(reward.id)}
                                className="h-7 text-xs"
                              >
                                Disburse
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {reward.disbursedAt
                            ? format(reward.disbursedAt, 'MMM d, yyyy')
                            : reward.approvedAt
                            ? format(reward.approvedAt, 'MMM d, yyyy')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
