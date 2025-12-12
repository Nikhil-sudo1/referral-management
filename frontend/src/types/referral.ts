export type ReferralStatus = 'submitted' | 'assigned' | 'contacted' | 'admitted' | 'rejected';

export type UserRole = 'super_admin' | 'manager' | 'counselor' | 'public';

export type RewardType = 'voucher' | 'points' | 'cashback';

export interface University {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  code: string;
  duration: string;
  feeStructure: number;
  commissionRate: number; // Percentage of fee as commission
  rewardAmount: number; // Fixed reward amount in USD
  rewardTier: 'bronze' | 'silver' | 'gold' | 'platinum'; // Visual tier
  status: 'active' | 'inactive';
}

export interface Referral {
  id: string;
  referralCode: string;
  referrerName: string;
  referrerPhone: string;
  referrerEmail: string;
  refereeName: string;
  refereePhone: string;
  refereeEmail: string;
  universityId: string;
  programId: string;
  counselorId?: string;
  status: ReferralStatus;
  submissionDate: Date;
  admissionDate?: Date;
  slabTier: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  universityId?: string;
}

export interface RewardLedger {
  id: string;
  referralId: string;
  userId: string;
  userType: 'referrer' | 'counselor' | 'referee';
  rewardType: RewardType;
  amount: number;
  status: 'pending' | 'approved' | 'disbursed';
  approvedBy?: string;
  approvedAt?: Date;
  disbursedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatarUrl?: string;
  rank: number;
  totalReferrals: number;
  totalAdmissions: number;
  conversionRate: number;
  totalRewards: number;
  growthRate: number;
}

export interface DashboardStats {
  totalReferrals: number;
  pendingAssignment: number;
  totalAdmissions: number;
  conversionRate: number;
  totalRewards: number;
  activeUniversities: number;
}
