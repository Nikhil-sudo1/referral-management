import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HRAdminLayout } from '@/components/layout/HRAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare, Inbox, CheckCircle, Clock, AlertTriangle, 
  RefreshCw, Mail, User, Calendar, ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

interface Request {
  id: string;
  referrer_id: string;
  referrer_name: string;
  referrer_email: string;
  request_type: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  created_at: string;
}

const HRAdminRequestCentre = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/hr-admin/requests?status=${activeTab !== 'all' ? activeTab : ''}`);
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Use sample data for demonstration
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-amber-500/30 text-amber-400">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Resolved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500/30 text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💰';
      case 'technical': return '🔧';
      case 'general': return '💬';
      case 'dispute': return '⚠️';
      default: return '📩';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Sample requests for demonstration
  const sampleRequests: Request[] = [
    {
      id: '1',
      referrer_id: 'ref1',
      referrer_name: 'Vikram Singh',
      referrer_email: 'vikram@company.com',
      request_type: 'payment',
      subject: 'Pending reward payment inquiry',
      message: 'I have not received my reward for the referral made 2 weeks ago. The candidate has already joined.',
      status: 'pending',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      referrer_id: 'ref2',
      referrer_name: 'Sneha Reddy',
      referrer_email: 'sneha@company.com',
      request_type: 'technical',
      subject: 'Unable to submit referral',
      message: 'Getting an error when trying to submit a new referral. Error code: 500.',
      status: 'in_progress',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      referrer_id: 'ref3',
      referrer_name: 'Amit Kumar',
      referrer_email: 'amit@company.com',
      request_type: 'general',
      subject: 'Query about referral bonus structure',
      message: 'Can you explain how the bonus tiers work? What is the difference between Gold and Platinum?',
      status: 'resolved',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayRequests = requests.length > 0 ? requests : sampleRequests;
  const filteredRequests = activeTab === 'all' 
    ? displayRequests 
    : displayRequests.filter(r => r.status === activeTab);

  const stats = {
    total: displayRequests.length,
    pending: displayRequests.filter(r => r.status === 'pending').length,
    in_progress: displayRequests.filter(r => r.status === 'in_progress').length,
    resolved: displayRequests.filter(r => r.status === 'resolved').length
  };

  if (loading) {
    return (
      <HRAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HRAdminLayout>
    );
  }

  return (
    <HRAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Request Centre
            </motion.h1>
            <p className="text-white/60 mt-1">
              Manage requests and inquiries from referrers
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchRequests}
            className="border-white/10 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: stats.total, icon: Inbox, color: 'blue' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
            { label: 'In Progress', value: stats.in_progress, icon: AlertTriangle, color: 'indigo' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'emerald' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/60">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Referrer Requests
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Review and respond to referrer inquiries
                  </CardDescription>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/20">All</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20">Pending</TabsTrigger>
                    <TabsTrigger value="in_progress" className="data-[state=active]:bg-indigo-500/20">In Progress</TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-emerald-500/20">Resolved</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getRequestTypeIcon(request.request_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium">{request.subject}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-white/60 text-sm line-clamp-2 mb-2">{request.message}</p>
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.referrer_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.referrer_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        View <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="py-12 text-center">
                    <Inbox className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No requests found</p>
                    <p className="text-white/30 text-sm mt-1">
                      {activeTab === 'all' 
                        ? 'Requests from referrers will appear here' 
                        : `No ${activeTab.replace('_', ' ')} requests`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-400 font-medium">Request Centre</p>
                <p className="text-white/60 text-sm mt-1">
                  This is where you can view and manage requests from referrers. Requests include payment inquiries,
                  technical issues, general questions, and dispute resolutions. Respond promptly to maintain referrer satisfaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRAdminLayout>
  );
};

export default HRAdminRequestCentre;

