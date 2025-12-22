import { useState, useEffect } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search, RefreshCw, CheckCircle, XCircle, Clock, DollarSign,
  TrendingUp, Users, FileText, Eye, ArrowRight, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { rewardsAPI, Reward } from '@/lib/api/rewards';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusColors: Record<string, string> = {
  pending_student_admin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved_student_admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending_account_team: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  approved_account_team: 'bg-green-500/20 text-green-400 border-green-500/30',
  disbursed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const StudentAdminPayouts = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_student_admin');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const pageSize = 15;

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    totalAmount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    // Only fetch data after authentication is complete
    if (!authLoading && isAuthenticated) {
      fetchData();
    }
  }, [currentPage, statusFilter, isAuthenticated, authLoading]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all pending approvals for stats
      const allPendingResponse = await rewardsAPI.getPendingStudentAdminApprovals({
        page: 1,
        limit: 500, // Get all for stats calculation (backend max is 500)
      });
      
      // Fetch paginated data for display
      const response = await rewardsAPI.getPendingStudentAdminApprovals({
        page: currentPage,
        limit: pageSize,
      });
      
      setRewards(response.items || []);
      // Backend returns 'pages', frontend uses 'total_pages'
      setTotalPages(response.pages || response.total_pages || 1);
      setTotalItems(response.total || 0);

      // Calculate stats from all pending items (not just current page)
      const allItems = allPendingResponse.items || [];
      const pendingRewards = allItems.filter(r => r.status === 'pending_student_admin');
      
      // For "Approved by Me", we'd need to fetch rewards with status pending_account_team
      // but that endpoint requires account team permissions, so we'll calculate from available data
      // In a real scenario, you'd need a separate endpoint for student-admin to see their approvals
      const approvedRewards: Reward[] = []; // Will be populated when backend adds endpoint
      
      // Ensure amounts are converted to numbers and sum properly
      // Convert each amount to a number, handling both string and number types
      const totalAmount = allItems.reduce((sum, r) => {
        let amount = 0;
        if (r.amount != null) {
          if (typeof r.amount === 'string') {
            amount = parseFloat(r.amount) || 0;
          } else if (typeof r.amount === 'number') {
            amount = r.amount;
          } else {
            // Handle Decimal or other types
            amount = Number(r.amount) || 0;
          }
        }
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      setStats({
        pending: pendingRewards.length,
        approved: approvedRewards.length,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
        totalCount: allPendingResponse.total || 0,
      });
    } catch (error: any) {
      console.error('Error fetching payouts:', error);
      
      // Handle specific error cases
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You must be logged in as Student Admin to access payout management. Please log in with Student Admin credentials.',
          variant: 'destructive',
        });
      } else if (status === 401) {
        toast({
          title: 'Not Authenticated',
          description: 'Please log in to access this page.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: detail || error.response?.data?.message || 'Failed to fetch payouts',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReward) return;

    try {
      setIsApproving(true);
      await rewardsAPI.approveByStudentAdmin(selectedReward.id, approvalNotes);
      
      toast({
        title: 'Success',
        description: 'Payout approved and sent to account team for final approval',
      });
      
      setApprovalDialogOpen(false);
      setSelectedReward(null);
      setApprovalNotes('');
      fetchData();
    } catch (error: any) {
      console.error('Error approving payout:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve payout',
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const openApprovalDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setApprovalNotes('');
    setApprovalDialogOpen(true);
  };

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = 
      reward.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.user_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <StudentAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve reward payouts before sending to account team
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold mt-1">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved by Me</p>
                  <p className="text-2xl font-bold mt-1">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold mt-1">₹{stats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by referral code, user name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_student_admin">Pending My Approval</SelectItem>
                  <SelectItem value="approved_student_admin">Approved by Me</SelectItem>
                  <SelectItem value="pending_account_team">Pending Account Team</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>
              Review and approve payouts. Approved payouts will be sent to account team for final approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payouts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRewards.map((reward) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Referral Code</p>
                          <p className="font-semibold">{reward.referral_code || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">User</p>
                          <p className="font-semibold">{reward.user_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{reward.user_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-bold text-lg">₹{Number(reward.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className={cn("mt-1", statusColors[reward.status] || statusColors.pending_student_admin)}>
                            {reward.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="text-sm">
                            {reward.created_at ? new Date(reward.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {reward.status === 'pending_student_admin' && (
                          <Button
                            onClick={() => openApprovalDialog(reward)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReward(reward);
                            // Open details dialog
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} payouts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Payout</DialogTitle>
              <DialogDescription>
                Review the payout details and add approval notes. This will send the payout to account team for final approval.
              </DialogDescription>
            </DialogHeader>
            {selectedReward && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Referral Code</Label>
                    <p className="font-semibold">{selectedReward.referral_code}</p>
                  </div>
                  <div>
                    <Label>User</Label>
                    <p className="font-semibold">{selectedReward.user_name}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="font-bold text-lg">₹{Number(selectedReward.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <Label>User Type</Label>
                    <p className="font-semibold">{selectedReward.user_type}</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Approval Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setApprovalDialogOpen(false);
                  setSelectedReward(null);
                  setApprovalNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Send to Account Team
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentAdminLayout>
  );
};

export default StudentAdminPayouts;

