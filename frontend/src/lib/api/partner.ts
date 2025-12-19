/**
 * Partner API
 * Handles partner types, organizations, and universities
 */
import apiClient from './client';

export interface PartnerType {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface University {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
}

export interface Organization {
  id: string;
  name: string;
}

export const partnerAPI = {
  // Get all partner types (Employee, Student Referrer)
  getPartnerTypes: async (): Promise<PartnerType[]> => {
    const response = await apiClient.get<{ success: boolean; data: PartnerType[] }>('/partner/types');
    return response.data.data;
  },

  // Get all universities
  getUniversities: async (): Promise<University[]> => {
    const response = await apiClient.get<{ success: boolean; data: University[] }>('/partner/universities');
    return response.data.data;
  },

  // Get organizations (for employees)
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<{ success: boolean; data: Organization[] }>('/partner/organizations');
    return response.data.data;
  },
};

