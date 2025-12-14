import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, CheckCircle, Clock, Gift, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { rewardsAPI, type Reward } from '@/lib/api';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-info/10 text-info border-info/20',
  disbursed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Rewards = () => {
  const [rewardsList, setRewardsList] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Fetch rewards on mount
  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const data = await rewardsAPI.getRewards({ page: 1, limit: 100 });
      setRewardsList(data.items);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const pendingRewards = rewardsList.filter((r) => r.status === 'pending');
  const totalPending = pendingRewards.reduce((sum, r) => sum + r.amount, 0);
  const totalDisbursed = rewardsList
    .filter((r) => r.status === 'disbursed')
    .reduce((sum, r) => sum + r.amount, 0);
  const avgReward = rewardsList.length > 0 
    ? Math.round(rewardsList.reduce((sum, r) => sum + r.amount, 0) / rewardsList.length)
    : 0;

  const handleApprove = async (rewardId: string) => {
    setActionLoading(rewardId);
    try {
      await rewardsAPI.approveReward(rewardId);
      toast({
        title: 'Reward Approved',
        description: 'The reward has been approved and queued for disbursement.',
      });
      fetchRewards();
    } catch (error) {
      console.error('Error approving reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve reward',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisburse = async (rewardId: string) => {
    setActionLoading(rewardId);
    try {
      await rewardsAPI.disburseReward(rewardId);
      toast({
        title: 'Reward Disbursed',
        description: 'The reward has been successfully disbursed.',
      });
      fetchRewards();
    } catch (error) {
      console.error('Error disbursing reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to disburse reward',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (rewardId: string) => {
    setActionLoading(rewardId);
    try {
      await rewardsAPI.cancelReward(rewardId);
      toast({
        title: 'Reward Cancelled',
        description: 'The reward has been cancelled.',
      });
      fetchRewards();
    } catch (error) {
      console.error('Error cancelling reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel reward',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                <div className="p-3 rounded-xl bg-info/10">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Reward</p>
                  <p className="text-2xl font-bold text-card-foreground">₹{avgReward.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Table */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-card-foreground">Recent Rewards</h2>
                <Badge variant="outline" className="text-muted-foreground">
                  {rewardsList.length} total
                </Badge>
              </div>

              {rewardsList.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-card-foreground mb-2">No Rewards Found</h3>
                  <p className="text-muted-foreground">Rewards will appear here once they are created.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewardsList.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {reward.user?.name || 'Unknown'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {reward.user?.email || ''}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reward.reward_type || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-card-foreground">
                            ₹{reward.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                'capitalize',
                                statusStyles[reward.status as keyof typeof statusStyles]
                              )}
                            >
                              {reward.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(reward.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {reward.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(reward.id)}
                                  disabled={actionLoading === reward.id}
                                >
                                  {actionLoading === reward.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Approve'
                                  )}
                                </Button>
                              )}
                              {reward.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDisburse(reward.id)}
                                  disabled={actionLoading === reward.id}
                                >
                                  {actionLoading === reward.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    'Disburse'
                                  )}
                                </Button>
                              )}
                              {(reward.status === 'pending' || reward.status === 'approved') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(reward.id)}
                                  disabled={actionLoading === reward.id}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
