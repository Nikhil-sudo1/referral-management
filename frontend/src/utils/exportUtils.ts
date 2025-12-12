import { referrals, universities, programs, counselors } from '@/data/mockData';
import { format } from 'date-fns';

export const exportToCSV = (type: 'referrals' | 'universities' | 'counselors' | 'referees', customData?: any[]) => {
  let csvContent = '';
  let filename = '';

  // Handle custom data export
  if (customData && customData.length > 0) {
    const headers = Object.keys(customData[0]).join(',');
    csvContent = headers + '\n';
    
    customData.forEach((row) => {
      const values = Object.values(row).map(val => {
        // Escape quotes and wrap in quotes if contains comma
        const str = String(val || '');
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvContent += values.join(',') + '\n';
    });
    
    filename = `${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  switch (type) {
    case 'referrals':
      // CSV Headers
      csvContent = 'Referral Code,Referee Name,Referee Email,Referee Phone,Referrer Name,Referrer Email,University,Program,Status,Submission Date,Admission Date\n';
      
      // CSV Data
      referrals.forEach((r) => {
        const university = universities.find((u) => u.id === r.universityId);
        const program = programs.find((p) => p.id === r.programId);
        csvContent += `"${r.referralCode}","${r.refereeName}","${r.refereeEmail}","${r.refereePhone}","${r.referrerName}","${r.referrerEmail}","${university?.name || 'N/A'}","${program?.name || 'N/A'}","${r.status}","${format(r.submissionDate, 'yyyy-MM-dd')}","${r.admissionDate ? format(r.admissionDate, 'yyyy-MM-dd') : 'N/A'}"\n`;
      });
      filename = `referrals_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      break;

    case 'universities':
      csvContent = 'University Name,Code,Status,Total Referrals,Admissions,Conversion Rate,Programs,Created Date\n';
      
      universities.forEach((uni) => {
        const uniReferrals = referrals.filter((r) => r.universityId === uni.id);
        const admissions = uniReferrals.filter((r) => r.status === 'admitted').length;
        const conversionRate = uniReferrals.length > 0 ? ((admissions / uniReferrals.length) * 100).toFixed(1) : 0;
        const programCount = programs.filter((p) => p.universityId === uni.id).length;
        
        csvContent += `"${uni.name}","${uni.code}","${uni.status}","${uniReferrals.length}","${admissions}","${conversionRate}%","${programCount}","${format(uni.createdAt, 'yyyy-MM-dd')}"\n`;
      });
      filename = `universities_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      break;

    case 'counselors':
      csvContent = 'Name,Email,Phone,University,Total Referrals,Status\n';
      
      counselors.forEach((c) => {
        const university = universities.find((u) => u.id === c.universityId);
        const counselorReferrals = referrals.filter((r) => r.counselorId === c.id);
        
        csvContent += `"${c.name}","${c.email}","${c.phone}","${university?.name || 'N/A'}","${counselorReferrals.length}","Active"\n`;
      });
      filename = `counselors_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      break;
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printReport = () => {
  window.print();
};

