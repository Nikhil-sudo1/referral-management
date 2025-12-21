/**
 * Partner API
 * Handles user types, roles, organizations, universities, and industries
 */
import apiClient from './client';

export interface Role {
  id: number;
  user_type_id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserType {
  id: number;
  name: string;
  code: string;
  description?: string;
  roles: Role[];
}

export interface University {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
}

export interface Industry {
  id: number;
  name: string;
}

export interface Organization {
  id: number;
  name: string;
  industry_id?: number;
}

export interface CreateOrganizationRequest {
  name: string;
  industry_id: number;
}

export const partnerAPI = {
  // Get all user types with their roles (Admin, Referral Partner)
  getUserTypes: async (): Promise<UserType[]> => {
    const response = await apiClient.get<{ success: boolean; data: UserType[] }>('/auth/user-types');
    return response.data.data;
  },

  // Get roles by user type id
  getRoles: async (userTypeId?: number): Promise<Role[]> => {
    const url = userTypeId 
      ? `/auth/roles?user_type_id=${userTypeId}`
      : '/auth/roles';
    const response = await apiClient.get<{ success: boolean; data: Role[] }>(url);
    return response.data.data;
  },

  // Get all universities
  getUniversities: async (): Promise<University[]> => {
    const response = await apiClient.get<{ success: boolean; data: University[] }>('/partner/universities');
    return response.data.data;
  },

  // Get all industries
  getIndustries: async (): Promise<Industry[]> => {
    const response = await apiClient.get<{ success: boolean; data: Industry[] }>('/partner/industries');
    return response.data.data;
  },

  // Get organizations by industry
  getOrganizationsByIndustry: async (industryId: number): Promise<Organization[]> => {
    const response = await apiClient.get<{ success: boolean; data: Organization[] }>(
      `/partner/industries/${industryId}/organizations`
    );
    return response.data.data;
  },

  // Get all organizations (optionally by industry)
  getOrganizations: async (industryId?: number): Promise<Organization[]> => {
    const url = industryId 
      ? `/partner/organizations?industry_id=${industryId}`
      : '/partner/organizations';
    const response = await apiClient.get<{ success: boolean; data: Organization[] }>(url);
    return response.data.data;
  },

  // Create a new organization (when user selects "Other")
  createOrganization: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post<{ success: boolean; data: Organization }>(
      '/partner/organizations',
      data
    );
    return response.data.data;
  },
};
