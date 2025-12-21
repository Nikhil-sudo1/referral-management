import { useState, useEffect } from 'react';
import { StudentAdminLayout } from '@/components/layout/StudentAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Inbox, Clock, CheckCircle, XCircle, MessageSquare,
  AlertCircle, Filter, RefreshCw, Eye, Send, User, Calendar,
  FileText, ChevronLeft, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

// Mock request types
const requestTypes = [
  { value: 'payout', label: 'Payout Request' },
  { value: 'support', label: 'Support Request' },
  { value: 'code_change', label: 'Code Change' },
  { value: 'account', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
];

// Mock requests data
const mockRequests = [
  {
    id: '1',
    referrer_name: 'Arjun Mehta',
    referrer_email: 'arjun.mehta@gmail.com',
    type: 'payout',
    subject: 'Payout not received for admitted referral',
    message: 'I referred a student who got admitted in January but I haven\'t received my payout yet. The referral code is REF-00123. Please help.',
    status: 'pending',
    priority: 'high',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    referrer_name: 'Kavya Iyer',
    referrer_email: 'kavya.iyer@gmail.com',
    type: 'code_change',
    subject: 'Request to change referral code',
    message: 'I would like to change my referral code from KAVYA-REF-2025 to a custom code. Is this possible?',
    status: 'in_progress',
    priority: 'medium',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    referrer_name: 'Rohit Verma',
    referrer_email: 'rohit.verma@gmail.com',
    type: 'support',
    subject: 'Unable to submit referral',
    message: 'Getting an error when trying to submit a new referral. The form shows validation error even though all fields are filled correctly.',
    status: 'pending',
    priority: 'high',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    referrer_name: 'Neha Gupta',
    referrer_email: 'neha.gupta@gmail.com',
    type: 'account',
    subject: 'Bank details update',
    message: 'I need to update my bank account details for payouts. How can I do this?',
    status: 'resolved',
    priority: 'low',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    resolution: 'Guided the referrer to Settings > Bank Details section to update their information.',
  },
  {
    id: '5',
    referrer_name: 'Sanjay Das',
    referrer_email: 'sanjay.das@gmail.com',
    type: 'payout',
    subject: 'Payout amount mismatch',
    message: 'The payout I received is ₹8,000 but the expected reward was ₹10,000. Please check and clarify.',
    status: 'in_progress',
    priority: 'high',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-green-500/20 text-green-400',
};

const StudentAdminRequestCentre = () => {
  const [requests, setRequests] = useState(mockRequests);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referrer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const viewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
    setReplyMessage('');
  };

  const handleStatusChange = (requestId: string, newStatus: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: newStatus, updated_at: new Date().toISOString() }
        : r
    ));
    
    if (selectedRequest?.id === requestId) {
      setSelectedRequest((prev: any) => ({ ...prev, status: newStatus }));
    }

    toast({
      title: 'Status Updated',
      description: `Request status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast({ title: 'Error', description: 'Please enter a message', variant: 'destructive' });
      return;
    }

    // In real app, this would send an email/notification to the referrer
    toast({
      title: 'Reply Sent',
      description: 'Your response has been sent to the referrer',
    });
    setReplyMessage('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <StudentAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Inbox className="w-8 h-8 text-emerald-400" />
              Request Centre
            </h1>
            <p className="text-white/60 mt-1">Manage requests from referrers</p>
          </div>
          <Button 
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/5"
            onClick={() => setIsLoading(true)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Requests</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Inbox className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">In Progress</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Resolved</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{stats.resolved}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-white">All Requests</CardTitle>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {requestTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="py-12 text-center text-white/40">
                    No requests found
                  </div>
                ) : (
                  filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                      onClick={() => viewRequest(request)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {request.referrer_name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium truncate">{request.subject}</h3>
                              <Badge className={priorityColors[request.priority]}>
                                {request.priority}
                              </Badge>
                            </div>
                            <p className="text-white/60 text-sm mb-2">{request.referrer_name} • {request.referrer_email}</p>
                            <p className="text-white/40 text-sm line-clamp-1">{request.message}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[request.status]}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-white/40 text-xs">{getTimeAgo(request.created_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  Showing {filteredRequests.length} requests
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-white/60 px-4">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-[#0a0a0f] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Request Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 mt-4">
              {/* Referrer Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                  {selectedRequest.referrer_name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedRequest.referrer_name}</p>
                  <p className="text-white/60 text-sm">{selectedRequest.referrer_email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge className={priorityColors[selectedRequest.priority]}>
                    {selectedRequest.priority}
                  </Badge>
                  <Badge className={statusColors[selectedRequest.status]}>
                    {selectedRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Request Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <FileText className="w-4 h-4" />
                  Type: {requestTypes.find(t => t.value === selectedRequest.type)?.label}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  Submitted: {formatDate(selectedRequest.created_at)}
                </div>
              </div>

              {/* Subject & Message */}
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="text-white font-medium mb-2">{selectedRequest.subject}</h4>
                <p className="text-white/70">{selectedRequest.message}</p>
              </div>

              {/* Resolution (if resolved) */}
              {selectedRequest.resolution && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Resolution</p>
                  </div>
                  <p className="text-white/70">{selectedRequest.resolution}</p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Update Status:</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={selectedRequest.status === 'in_progress' ? 'default' : 'outline'}
                      className={selectedRequest.status === 'in_progress' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'border-white/10 text-white hover:bg-white/5'}
                      onClick={() => handleStatusChange(selectedRequest.id, 'in_progress')}
                    >
                      In Progress
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedRequest.status === 'resolved' ? 'default' : 'outline'}
                      className={selectedRequest.status === 'resolved' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'border-white/10 text-white hover:bg-white/5'}
                      onClick={() => handleStatusChange(selectedRequest.id, 'resolved')}
                    >
                      Resolved
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedRequest.status === 'rejected' ? 'default' : 'outline'}
                      className={selectedRequest.status === 'rejected' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'border-white/10 text-white hover:bg-white/5'}
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                    >
                      Rejected
                    </Button>
                  </div>
                </div>

                {/* Reply Section */}
                <div className="space-y-2">
                  <label className="text-white/60 text-sm">Send Reply to Referrer</label>
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your response here..."
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={handleSendReply}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="border-white/10 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentAdminLayout>
  );
};

export default StudentAdminRequestCentre;

