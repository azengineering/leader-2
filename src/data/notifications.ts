
'use server';

import { supabase } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  notification_type: 'announcement' | 'alert' | 'info' | 'warning';
  show_banner: boolean;
  link: string | null;
  created_at: string;
  updated_at: string;
  target_filters?: {
    states?: string[];
    constituencies?: string[];
    gender?: string[];
    age_min?: number;
    age_max?: number;
  };
}

export interface CreateNotificationData {
  message: string;
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  title?: string;
  notification_type?: 'announcement' | 'alert' | 'info' | 'warning';
  show_banner?: boolean;
  link?: string | null;
  target_filters?: {
    states?: string[];
    constituencies?: string[];
    gender?: string[];
    age_min?: number;
    age_max?: number;
  };
}

export interface UpdateNotificationData extends Partial<CreateNotificationData> {}

export async function getNotifications(): Promise<SiteNotification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

import { User } from './users'; // Import User interface

export async function getActiveNotifications(userProfile: User | null): Promise<SiteNotification[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('isActive', true)
      .or(`startTime.is.null,startTime.lte.${now}`)
      .or(`endTime.is.null,endTime.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active notifications:', error);
      throw new Error(`Failed to fetch active notifications: ${error.message}`);
    }

    const allActiveNotifications: SiteNotification[] = data || [];

    // Filter notifications based on user profile
    const filteredNotifications = allActiveNotifications.filter(notification => {
      const filters = notification.target_filters;
      console.log('--- Processing Notification:', notification.id);
      console.log('Notification Filters:', filters);
      console.log('User Profile:', userProfile);

      // If no filters are defined, the notification applies to all users
      if (!filters || (
        !filters.states?.length &&
        !filters.constituencies?.length &&
        !filters.gender?.length &&
        filters.age_min === undefined &&
        filters.age_max === undefined
      )) {
        console.log('No filters defined or all filters empty. Showing notification.');
        return true;
      }

      // If filters exist but no user profile, don't show the notification
      if (!userProfile) {
        console.log('Filters exist but no user profile. Hiding notification.');
        return false;
      }

      let matches = true;

      // Check state filter
      if (filters.states && filters.states.length > 0) {
        const stateMatch = userProfile.state && filters.states.includes(userProfile.state);
        console.log(`State Filter: User State '${userProfile.state}', Target States '${filters.states}', Match: ${stateMatch}`);
        if (!stateMatch) {
          matches = false;
        }
      }

      // Check constituency filter
      if (matches && filters.constituencies && filters.constituencies.length > 0) {
        const userConstituencies = [userProfile.mpConstituency, userProfile.mlaConstituency, userProfile.panchayat].filter(Boolean);
        const hasMatchingConstituency = filters.constituencies.some(filterConstituency =>
          userConstituencies.some(userConst => userConst?.toLowerCase() === filterConstituency.toLowerCase())
        );
        console.log(`Constituency Filter: User Constituencies '${userConstituencies}', Target Constituencies '${filters.constituencies}', Match: ${hasMatchingConstituency}`);
        if (!hasMatchingConstituency) {
          matches = false;
        }
      }

      // Check gender filter
      if (matches && filters.gender && filters.gender.length > 0) {
        const userGenderLower = userProfile.gender?.toLowerCase();
        const targetGendersLower = filters.gender.map(g => g.toLowerCase());
        const genderMatch = userGenderLower && targetGendersLower.includes(userGenderLower);
        console.log(`Gender Filter: User Gender '${userProfile.gender}' (normalized to '${userGenderLower}'), Target Genders '${filters.gender}' (normalized to '${targetGendersLower}'), Match: ${genderMatch}`);
        if (!genderMatch) {
          matches = false;
        }
      }

      // Check age filter
      if (matches && (filters.age_min !== undefined || filters.age_max !== undefined)) {
        let ageMatch = true;
        if (userProfile.age === undefined || userProfile.age === null) {
          ageMatch = false; // User has no age, but age filter is set
        } else {
          if (filters.age_min !== undefined && userProfile.age < filters.age_min) {
            ageMatch = false;
          }
          if (filters.age_max !== undefined && userProfile.age > filters.age_max) {
            ageMatch = false;
          }
        }
        console.log(`Age Filter: User Age '${userProfile.age}', Target Min '${filters.age_min}', Target Max '${filters.age_max}', Match: ${ageMatch}`);
        if (!ageMatch) {
          matches = false;
        }
      }

      console.log(`Final decision for notification ${notification.id}: ${matches ? 'SHOW' : 'HIDE'}`);
      return matches;
    });

    return filteredNotifications;
  } catch (error) {
    console.error('Error in getActiveNotifications:', error);
    return [];
  }
}

export async function addNotification(notificationData: CreateNotificationData): Promise<SiteNotification> {
  try {
    // Validate required fields
    if (!notificationData.message?.trim()) {
      throw new Error('Message is required');
    }

    if (notificationData.startTime && notificationData.endTime) {
      const start = new Date(notificationData.startTime);
      const end = new Date(notificationData.endTime);
      if (start >= end) {
        throw new Error('End time must be after start time');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        title: notificationData.title || 'Site Notification',
        message: notificationData.message.trim(),
        isActive: notificationData.isActive,
        startTime: notificationData.startTime,
        endTime: notificationData.endTime,
        notification_type: notificationData.notification_type || 'announcement',
        show_banner: notificationData.show_banner ?? true,
        link: notificationData.link,
        target_filters: notificationData.target_filters,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding notification:', error);
      throw new Error(`Failed to add notification: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in addNotification:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add notification');
  }
}

export async function updateNotification(id: string, updates: UpdateNotificationData): Promise<void> {
  try {
    if (!id) {
      throw new Error('Notification ID is required');
    }

    // Validate updates
    if (updates.message !== undefined && !updates.message?.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (updates.startTime && updates.endTime) {
      const start = new Date(updates.startTime);
      const end = new Date(updates.endTime);
      if (start >= end) {
        throw new Error('End time must be after start time');
      }
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
      target_filters: updates.target_filters,
    };

    if (updates.message) {
      updateData.message = updates.message.trim();
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating notification:', error);
      throw new Error(`Failed to update notification: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateNotification:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update notification');
  }
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    if (!id) {
      throw new Error('Notification ID is required');
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete notification');
  }
}
