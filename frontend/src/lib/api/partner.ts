/**
 * Partner API
 * Handles user types, roles, organizations, and universities
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

export interface Organization {
  id: number;
  name: string;
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

  // Get organizations (companies for employees)
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<{ success: boolean; data: Organization[] }>('/partner/organizations');
    return response.data.data;
  },
};
