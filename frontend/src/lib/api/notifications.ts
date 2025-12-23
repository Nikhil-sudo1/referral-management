import apiClient from './client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const notificationsAPI = {
  // Get all notifications
  getNotifications: async (params?: {
    page?: number;
    page_size?: number;
    limit?: number;
    is_read?: boolean;
  }): Promise<PaginatedResponse<Notification>> => {
    // Backend uses 'limit' not 'page_size'
    const backendParams = {
      ...params,
      limit: params?.page_size || params?.limit || 20,
      page_size: undefined, // Remove page_size
    };
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Notification> }>('/notifications', { params: backendParams });
    const data = response.data.data;
    // Map backend response format to frontend expected format
    return {
      items: data.items,
      total: data.total,
      page: data.page,
      page_size: data.limit || data.page_size || 20,
      total_pages: data.pages || data.total_pages || 1,
    };
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
    return response.data.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch<{ success: boolean; message: string }>(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return { message: response.data.message };
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

