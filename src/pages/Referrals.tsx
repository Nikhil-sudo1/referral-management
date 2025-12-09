import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { referrals, universities, programs, counselors } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ReferralStatus } from '@/types/referral';
import { Search, Filter, UserPlus, Eye, MoreHorizontal, Download } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const statusStyles: Record<ReferralStatus, string> = {
  submitted: 'bg-info/10 text-info border-info/20',
  assigned: 'bg-warning/10 text-warning border-warning/20',
  contacted: 'bg-accent/10 text-accent border-accent/20',
  admitted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Referrals = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.refereeName.toLowerCase().includes(search.toLowerCase()) ||
      r.referrerName.toLowerCase().includes(search.toLowerCase()) ||
      r.referralCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAssign = (referralId: string, counselorId: string) => {
    toast({
      title: 'Counselor Assigned',
      description: `Referral has been assigned to ${counselors.find((c) => c.id === counselorId)?.name}`,
    });
    setSelectedReferral(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referrals</h1>
            <p className="text-muted-foreground mt-1">Manage all referral submissions</p>
          </div>
          <Button
            onClick={() => {
              exportToCSV('referrals');
              toast({
                title: 'Export Started',
                description: 'Your CSV file is being downloaded',
              });
            }}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Code</TableHead>
                <TableHead>Referee</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Counselor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.map((referral) => {
                const university = universities.find((u) => u.id === referral.universityId);
                const program = programs.find((p) => p.id === referral.programId);
                const counselor = counselors.find((c) => c.id === referral.counselorId);

                return (
                  <TableRow key={referral.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm text-primary">{referral.referralCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-card-foreground">{referral.refereeName}</p>
                        <p className="text-xs text-muted-foreground">{referral.refereeEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-card-foreground">{referral.referrerName}</p>
                        <p className="text-xs text-muted-foreground">{referral.referrerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-card-foreground">{university?.code}</p>
                        <p className="text-xs text-muted-foreground">{program?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {counselor ? (
                        <span className="text-sm text-card-foreground">{counselor.name}</span>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 text-xs">
                              <UserPlus className="w-3 h-3 mr-1" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Counselor</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Select Counselor</Label>
                                <Select onValueChange={(v) => handleAssign(referral.id, v)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a counselor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {counselors.map((c) => (
                                      <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', statusStyles[referral.status])}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(referral.submissionDate, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Send Notification</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
