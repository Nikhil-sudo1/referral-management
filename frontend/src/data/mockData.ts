import { University, Program, Referral, User, LeaderboardEntry, DashboardStats, RewardLedger } from '@/types/referral';

export const universities: University[] = [
  { id: '1', name: 'Massachusetts Institute of Technology', code: 'MIT', status: 'active', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Stanford University', code: 'STAN', status: 'active', createdAt: new Date('2024-01-15') },
  { id: '3', name: 'Harvard Business School', code: 'HBS', status: 'active', createdAt: new Date('2024-02-01') },
  { id: '4', name: 'Oxford University', code: 'OXF', status: 'active', createdAt: new Date('2024-02-15') },
];

export const programs: Program[] = [
  { id: '1', universityId: '1', name: 'MBA Program', code: 'MBA', duration: '2 years', feeStructure: 85000, commissionRate: 3.5, rewardAmount: 2975, rewardTier: 'platinum', status: 'active' },
  { id: '2', universityId: '1', name: 'MS Computer Science', code: 'MSCS', duration: '2 years', feeStructure: 75000, commissionRate: 3.0, rewardAmount: 2250, rewardTier: 'gold', status: 'active' },
  { id: '3', universityId: '2', name: 'Executive MBA', code: 'EMBA', duration: '18 months', feeStructure: 95000, commissionRate: 4.0, rewardAmount: 3800, rewardTier: 'platinum', status: 'active' },
  { id: '4', universityId: '2', name: 'MS Data Science', code: 'MSDS', duration: '2 years', feeStructure: 70000, commissionRate: 2.5, rewardAmount: 1750, rewardTier: 'silver', status: 'active' },
  { id: '5', universityId: '3', name: 'MBA', code: 'MBA', duration: '2 years', feeStructure: 110000, commissionRate: 5.0, rewardAmount: 5500, rewardTier: 'platinum', status: 'active' },
  { id: '6', universityId: '4', name: 'MSc Finance', code: 'MSFIN', duration: '1 year', feeStructure: 65000, commissionRate: 2.0, rewardAmount: 1300, rewardTier: 'bronze', status: 'active' },
];

export const counselors: User[] = [
  { id: 'c1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567890', role: 'counselor', universityId: '1' },
  { id: 'c2', name: 'Michael Chen', email: 'michael@example.com', phone: '+1234567891', role: 'counselor', universityId: '1' },
  { id: 'c3', name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567892', role: 'counselor', universityId: '2' },
  { id: 'c4', name: 'David Wilson', email: 'david@example.com', phone: '+1234567893', role: 'counselor', universityId: '2' },
  { id: 'c5', name: 'Jessica Brown', email: 'jessica@example.com', phone: '+1234567894', role: 'counselor', universityId: '3' },
];

export const referrals: Referral[] = [
  { id: '1', referralCode: 'MIT-MBA-12345', referrerName: 'John Smith', referrerPhone: '+1111111111', referrerEmail: 'john@email.com', refereeName: 'Alice Johnson', refereePhone: '+2222222222', refereeEmail: 'alice@email.com', universityId: '1', programId: '1', counselorId: 'c1', status: 'admitted', submissionDate: new Date('2024-10-01'), admissionDate: new Date('2024-11-15'), slabTier: 1 },
  { id: '2', referralCode: 'MIT-MSCS-23456', referrerName: 'John Smith', referrerPhone: '+1111111111', referrerEmail: 'john@email.com', refereeName: 'Bob Williams', refereePhone: '+3333333333', refereeEmail: 'bob@email.com', universityId: '1', programId: '2', counselorId: 'c1', status: 'contacted', submissionDate: new Date('2024-10-15'), slabTier: 1 },
  { id: '3', referralCode: 'STAN-EMBA-34567', referrerName: 'Maria Garcia', referrerPhone: '+4444444444', referrerEmail: 'maria@email.com', refereeName: 'Charlie Brown', refereePhone: '+5555555555', refereeEmail: 'charlie@email.com', universityId: '2', programId: '3', counselorId: 'c3', status: 'assigned', submissionDate: new Date('2024-11-01'), slabTier: 1 },
  { id: '4', referralCode: 'HBS-MBA-45678', referrerName: 'Robert Lee', referrerPhone: '+6666666666', referrerEmail: 'robert@email.com', refereeName: 'Diana Prince', refereePhone: '+7777777777', refereeEmail: 'diana@email.com', universityId: '3', programId: '5', status: 'submitted', submissionDate: new Date('2024-11-20'), slabTier: 1 },
  { id: '5', referralCode: 'MIT-MBA-56789', referrerName: 'John Smith', referrerPhone: '+1111111111', referrerEmail: 'john@email.com', refereeName: 'Eve Wilson', refereePhone: '+8888888888', refereeEmail: 'eve@email.com', universityId: '1', programId: '1', counselorId: 'c2', status: 'admitted', submissionDate: new Date('2024-09-15'), admissionDate: new Date('2024-10-30'), slabTier: 2 },
  { id: '6', referralCode: 'OXF-MSFIN-67890', referrerName: 'Anna Taylor', referrerPhone: '+9999999999', referrerEmail: 'anna@email.com', refereeName: 'Frank Moore', refereePhone: '+1010101010', refereeEmail: 'frank@email.com', universityId: '4', programId: '6', status: 'submitted', submissionDate: new Date('2024-11-25'), slabTier: 1 },
  { id: '7', referralCode: 'STAN-MSDS-78901', referrerName: 'Maria Garcia', referrerPhone: '+4444444444', referrerEmail: 'maria@email.com', refereeName: 'Grace Lee', refereePhone: '+1212121212', refereeEmail: 'grace@email.com', universityId: '2', programId: '4', counselorId: 'c4', status: 'contacted', submissionDate: new Date('2024-10-20'), slabTier: 2 },
  { id: '8', referralCode: 'MIT-MSCS-89012', referrerName: 'Peter Brown', referrerPhone: '+1313131313', referrerEmail: 'peter@email.com', refereeName: 'Henry Clark', refereePhone: '+1414141414', refereeEmail: 'henry@email.com', universityId: '1', programId: '2', counselorId: 'c1', status: 'rejected', submissionDate: new Date('2024-09-01'), slabTier: 1 },
];

export const leaderboard: LeaderboardEntry[] = [
  { userId: 'r1', userName: 'John Smith', rank: 1, totalReferrals: 15, totalAdmissions: 8, conversionRate: 53.3, totalRewards: 2450, growthRate: 25 },
  { userId: 'r2', userName: 'Maria Garcia', rank: 2, totalReferrals: 12, totalAdmissions: 6, conversionRate: 50.0, totalRewards: 1800, growthRate: 18 },
  { userId: 'r3', userName: 'Peter Brown', rank: 3, totalReferrals: 10, totalAdmissions: 5, conversionRate: 50.0, totalRewards: 1500, growthRate: 12 },
  { userId: 'r4', userName: 'Anna Taylor', rank: 4, totalReferrals: 8, totalAdmissions: 4, conversionRate: 50.0, totalRewards: 1200, growthRate: 8 },
  { userId: 'r5', userName: 'Robert Lee', rank: 5, totalReferrals: 6, totalAdmissions: 3, conversionRate: 50.0, totalRewards: 900, growthRate: 5 },
];

export const counselorLeaderboard: LeaderboardEntry[] = [
  { userId: 'c1', userName: 'Sarah Johnson', rank: 1, totalReferrals: 45, totalAdmissions: 28, conversionRate: 62.2, totalRewards: 5600, growthRate: 32 },
  { userId: 'c3', userName: 'Emily Davis', rank: 2, totalReferrals: 38, totalAdmissions: 22, conversionRate: 57.9, totalRewards: 4400, growthRate: 24 },
  { userId: 'c2', userName: 'Michael Chen', rank: 3, totalReferrals: 32, totalAdmissions: 18, conversionRate: 56.3, totalRewards: 3600, growthRate: 18 },
  { userId: 'c4', userName: 'David Wilson', rank: 4, totalReferrals: 28, totalAdmissions: 15, conversionRate: 53.6, totalRewards: 3000, growthRate: 12 },
  { userId: 'c5', userName: 'Jessica Brown', rank: 5, totalReferrals: 22, totalAdmissions: 11, conversionRate: 50.0, totalRewards: 2200, growthRate: 8 },
];

export const dashboardStats: DashboardStats = {
  totalReferrals: 156,
  pendingAssignment: 12,
  totalAdmissions: 67,
  conversionRate: 42.9,
  totalRewards: 45600,
  activeUniversities: 4,
};

export const rewards: RewardLedger[] = [
  { id: 'rw1', referralId: '1', userId: 'r1', userType: 'referrer', rewardType: 'points', amount: 200, status: 'disbursed', disbursedAt: new Date('2024-11-20') },
  { id: 'rw2', referralId: '1', userId: 'c1', userType: 'counselor', rewardType: 'cashback', amount: 150, status: 'approved', approvedAt: new Date('2024-11-18') },
  { id: 'rw3', referralId: '5', userId: 'r1', userType: 'referrer', rewardType: 'points', amount: 250, status: 'disbursed', disbursedAt: new Date('2024-11-05') },
  { id: 'rw4', referralId: '5', userId: 'c2', userType: 'counselor', rewardType: 'cashback', amount: 175, status: 'pending' },
];

export const monthlyReferralData = [
  { month: 'Jul', referrals: 18, admissions: 7 },
  { month: 'Aug', referrals: 24, admissions: 10 },
  { month: 'Sep', referrals: 28, admissions: 12 },
  { month: 'Oct', referrals: 35, admissions: 15 },
  { month: 'Nov', referrals: 42, admissions: 18 },
  { month: 'Dec', referrals: 9, admissions: 5 },
];

export const universityWiseData = [
  { name: 'MIT', referrals: 45, admissions: 22, color: 'hsl(226, 70%, 45%)' },
  { name: 'Stanford', referrals: 38, admissions: 18, color: 'hsl(262, 83%, 58%)' },
  { name: 'Harvard', referrals: 42, admissions: 16, color: 'hsl(142, 71%, 45%)' },
  { name: 'Oxford', referrals: 31, admissions: 11, color: 'hsl(38, 92%, 50%)' },
];
