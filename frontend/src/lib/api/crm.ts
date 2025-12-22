import apiClient from './client';

export interface CRMUniversity {
  id: number;
  name: string;
  short_name?: string;
  [key: string]: any;
}

export interface CRMCourse {
  id: number;
  name: string;
  parent_id?: number;
  [key: string]: any;
}

export const crmAPI = {
  // Get universities from CRM
  getUniversities: async (): Promise<CRMUniversity[]> => {
    const response = await apiClient.post<{ success: boolean; data: CRMUniversity[] }>('/crm/universities');
    return response.data.data;
  },

  // Get courses from CRM for a specific university
  getCourses: async (universityId: number): Promise<CRMCourse[]> => {
    const response = await apiClient.post<{ success: boolean; data: CRMCourse[] }>(`/crm/courses?university_id=${universityId}`);
    return response.data.data;
  },
};

