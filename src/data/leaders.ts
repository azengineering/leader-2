'use server';

import { supabase } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uploadLeaderPhoto, uploadLeaderManifesto, deleteStorageFile } from '@/lib/supabase/storage';

// The Leader interface now expects Files for photo and manifesto during creation/update
export interface Leader {
  id: string;
  name: string;
  partyName: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  photoUrl: string;
  constituency: string;
  nativeAddress: string;
  electionType: 'national' | 'state' | 'panchayat';
  location: {
    state?: string;
    district?: string;
  };
  rating: number;
  reviewCount: number;
  previousElections: Array<{
    electionType: string;
    constituency: string;
    status: 'winner' | 'loser';
    electionYear: string;
    partyName: string;
    state?: string;
  }>;
  manifestoUrl?: string;
  twitterUrl?: string;
  addedByUserId?: string | null;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string | null;
  userName?: string;
}

// This interface is used for the form data, accepting File objects
export interface LeaderFormData extends Omit<Leader, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'status' | 'adminComment' | 'userName' | 'photoUrl' | 'manifestoUrl'> {
  photoFile?: File | null;
  manifestoFile?: File | null;
  photoUrl?: string;
  manifestoUrl?: string;
}

export interface Review {
  userName: string;
  rating: number;
  comment: string | null;
  updatedAt: string;
  socialBehaviour: string | null;
}

export interface UserActivity {
  leaderId: string;
  leaderName: string;
  leaderPhotoUrl: string;
  rating: number;
  comment: string | null;
  updatedAt: string;
  leader: Leader;
  socialBehaviour: string | null;
  userName: string;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface SocialBehaviourDistribution {
  name: string;
  count: number;
}


// --- Public API ---

export async function getLeaders(): Promise<Leader[]> {
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('status', 'approved');

  if (error) {
    console.error("Error fetching leaders:", error);
    return [];
  }
  return data.map(leader => ({
      ...leader,
      previousElections: leader.previousElections || []
  }));
}

export async function addLeader(leaderData: LeaderFormData, userId: string | null): Promise<void> {
    let photoUrl = '';
    if (leaderData.photoFile) {
        photoUrl = await uploadLeaderPhoto(leaderData.photoFile);
    }

    let manifestoUrl = '';
    if (leaderData.manifestoFile) {
        manifestoUrl = await uploadLeaderManifesto(leaderData.manifestoFile);
    }

    const { photoFile, manifestoFile, ...restOfLeaderData } = leaderData;

    const { error } = await supabase.from('leaders').insert({
        ...restOfLeaderData,
        photoUrl,
        manifestoUrl,
        addedByUserId: userId,
        status: 'pending'
    });

    if (error) {
        console.error("Error adding leader:", error);
        // If the database insert fails, we should delete the files that were just uploaded
        await deleteStorageFile(supabase, photoUrl, 'leader-photos');
        await deleteStorageFile(supabase, manifestoUrl, 'leader-manifestos');
        throw error;
    }
}

export async function getLeaderById(id: string): Promise<Leader | null> {
    const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching leader by ID:", error);
        return null;
    }
    return {
        ...data,
        previousElections: data.previousElections || []
    };
}

export async function updateLeader(leaderId: string, leaderData: LeaderFormData, userId: string | null, isAdmin: boolean): Promise<Leader | null> {
    const db = isAdmin ? supabaseAdmin : supabase;

    const leaderToUpdate = await getLeaderById(leaderId);
    if (!leaderToUpdate) throw new Error("Leader not found.");

    if (!isAdmin && leaderToUpdate.addedByUserId !== userId) {
        throw new Error("You are not authorized to edit this leader.");
    }

    const { photoFile, manifestoFile, ...restOfLeaderData } = leaderData;
    const payload: Partial<Leader> = { ...restOfLeaderData };

    // Handle photo update/removal
    if (photoFile) {
        // New file uploaded, will replace the old one
        payload.photoUrl = await uploadLeaderPhoto(photoFile, leaderToUpdate.photoUrl);
    } else if (leaderData.photoUrl === '') {
        // Photo explicitly removed
        await deleteStorageFile(db, leaderToUpdate.photoUrl, 'leader-photos');
        payload.photoUrl = '';
    }

    // Handle manifesto update/removal
    if (manifestoFile) {
        // New file uploaded, will replace the old one
        payload.manifestoUrl = await uploadLeaderManifesto(manifestoFile, leaderToUpdate.manifestoUrl);
    } else if (leaderData.manifestoUrl === '') {
        // Manifesto explicitly removed
        await deleteStorageFile(db, leaderToUpdate.manifestoUrl, 'leader-manifestos');
        payload.manifestoUrl = '';
    }

    if (!isAdmin) {
        payload.status = 'pending';
        payload.adminComment = 'User updated details. Pending re-approval.';
    }

    const { data, error } = await db
        .from('leaders')
        .update(payload)
        .eq('id', leaderId)
        .select()
        .single();

    if (error) {
        console.error("Error updating leader:", error);
        // Note: We are not deleting the newly uploaded files here on purpose.
        // The update failed, but the user might want to retry without re-uploading.
        // A cleanup job could handle orphaned files later if needed.
        throw error;
    }
    return data;
}

export async function submitRatingAndComment(leaderId: string, userId: string, newRating: number, comment: string | null, socialBehaviour: string | null): Promise<Leader | null> {
    const { error } = await supabase.rpc('handle_new_rating', {
        p_leader_id: leaderId,
        p_user_id: userId,
        p_rating: newRating,
        p_comment: comment,
        p_social_behaviour: socialBehaviour
    });

    if (error) {
        console.error('Error submitting rating via RPC:', error);
        throw error;
    }

    return getLeaderById(leaderId);
}

export async function getReviewsForLeader(leaderId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .rpc('get_reviews_for_leader', { p_leader_id: leaderId });

    if (error) {
        console.error('Error getting reviews for leader:', error);
        return [];
    }
    return data;
}

export async function getRatingDistribution(leaderId: string): Promise<RatingDistribution[]> {
    const { data, error } = await supabaseAdmin
        .from('ratings')
        .select('rating')
        .eq('leaderId', leaderId);

    if (error) {
        console.error("Error getting rating distribution:", error);
        return [];
    }

    // Group ratings manually
    const ratingCounts = data.reduce((acc, { rating }) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    return Object.entries(ratingCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count
    }));
}

export async function getSocialBehaviourDistribution(leaderId: string): Promise<SocialBehaviourDistribution[]> {
    const { data, error } = await supabaseAdmin
        .from('ratings')
        .select('socialBehaviour')
        .eq('leaderId', leaderId)
        .not('socialBehaviour', 'is', null);

    if (error) {
        console.error("Error getting social behaviour distribution:", error);
        return [];
    }

    // Group social behaviours manually
    const behaviourCounts = data.reduce((acc, { socialBehaviour }) => {
        if (socialBehaviour) {
            acc[socialBehaviour] = (acc[socialBehaviour] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(behaviourCounts).map(([behaviour, count]) => ({
        name: behaviour.charAt(0).toUpperCase() + behaviour.slice(1).replace('-', ' '),
        count
    }));
}

export async function getActivitiesForUser(userId: string): Promise<UserActivity[]> {
     const { data, error } = await supabase
        .rpc('get_user_activities', { p_user_id: userId });

    if (error) {
        console.error('Error getting user activities:', error);
        return [];
    }

    // For each activity, fetch the full leader details
    const activitiesWithLeaders = await Promise.all(data.map(async (activity: UserActivity) => {
        const leader = await getLeaderById(activity.leaderId);
        return {
            ...activity,
            leader: leader || {} as Leader // Ensure leader is always an object, even if empty
        };
    }));

    return activitiesWithLeaders;
}

export async function getAllActivities(): Promise<UserActivity[]> {
    const { data, error } = await supabaseAdmin.rpc('get_all_activities');

    if (error) {
        console.error('Error getting all activities:', error);
        return [];
    }
    return data;
}

export async function getLeadersAddedByUser(userId: string): Promise<Leader[]> {
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('addedByUserId', userId)
    .order('name', { ascending: true });

  if (error) {
      console.error("Error getting leaders added by user:", error);
      return [];
  }
  return data.map(leader => ({
      ...leader,
      previousElections: leader.previousElections || []
  }));
}


export async function getLeaderCount(filters?: { startDate?: string, endDate?: string, state?: string, constituency?: string }): Promise<number> {
    let query = supabaseAdmin.from('leaders').select('*', { count: 'exact', head: true });

    if (filters?.startDate) query = query.gte('createdAt', filters.startDate);
    if (filters?.endDate) query = query.lte('createdAt', filters.endDate);
    if (filters?.state) query = query.eq('location->>state', filters.state);
    if (filters?.constituency) query = query.ilike('constituency', `%${filters.constituency}%`);

    const { error, count } = await query;
    if (error) console.error("Error getting leader count:", error);
    return count ?? 0;
}

export async function getRatingCount(filters?: { startDate?: string, endDate?: string, state?: string, constituency?: string }): Promise<number> {
    let query = supabaseAdmin.from('ratings').select('leaderId, leaders!inner(*)', { count: 'exact', head: true });

    if (filters?.startDate) query = query.gte('createdAt', filters.startDate);
    if (filters?.endDate) query = query.lte('createdAt', filters.endDate);
    if (filters?.state) query = query.eq('leaders.location->>state', filters.state);
    if (filters?.constituency) query = query.ilike('leaders.constituency', `%${filters.constituency}%`);

    const { error, count } = await query;
    if (error) console.error("Error getting rating count:", error);
    return count ?? 0;
}

// --- Admin Functions ---
export async function getLeadersForAdminPanel(filters: { dateFrom?: string; dateTo?: string; state?: string; constituency?: string; candidateName?: string; }): Promise<Leader[]> {
  try {
    let query = supabaseAdmin
      .from('leaders')
      .select(`
            *,
            userName:users!leaders_addedByUserId_fkey(name),
            ratings!ratings_leaderId_fkey(rating)
          `)
      .order('createdAt', { ascending: false });

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (!isNaN(fromDate.getTime())) {
        query = query.gte('createdAt', filters.dateFrom);
      }
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      if (!isNaN(toDate.getTime())) {
        query = query.lte('createdAt', filters.dateTo);
      }
    }

    if (filters.state && filters.state !== 'all-states') {
      query = query.eq('location->>state', filters.state);
    }

    if (filters.constituency) {
      query = query.ilike('constituency', `%${filters.constituency}%`);
    }

    if (filters.candidateName) {
      query = query.ilike('name', `%${filters.candidateName}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leaders for admin:", error);
      throw error;
    }

    return (data || []).map(leader => ({
        ...leader,
        userName: (leader.userName as any)?.name ?? 'Admin/System',
        previousElections: Array.isArray(leader.previousElections) ? leader.previousElections : []
    }));

  } catch (error) {
    console.error("Error in getLeadersForAdminPanel:", error);
    throw new Error('Failed to fetch leaders data');
  }
}

export async function approveLeader(leaderId: string): Promise<void> {
    await updateLeaderStatus(leaderId, 'approved', 'Approved by admin.');
}

export async function updateLeaderStatus(leaderId: string, status: 'pending' | 'approved' | 'rejected', adminComment: string | null): Promise<void> {
  const { error } = await supabaseAdmin
    .from('leaders')
    .update({ status, adminComment })
    .eq('id', leaderId);

  if (error) {
      console.error("Error updating leader status:", error);
      throw error;
  }
}

export async function deleteLeader(leaderId: string): Promise<void> {
    // First, get the leader's data to find their file URLs
    const leaderToDelete = await getLeaderById(leaderId);
    if (!leaderToDelete) {
        console.error("Attempted to delete a leader that does not exist:", leaderId);
        // If leader doesn't exist, there's nothing to do.
        return;
    }

    // Now, delete the files from storage using supabaseAdmin to bypass RLS
    await deleteStorageFile(supabaseAdmin, leaderToDelete.photoUrl, 'leader-photos');
    await deleteStorageFile(supabaseAdmin, leaderToDelete.manifestoUrl, 'leader-manifestos');

    // Finally, delete the leader record from the database
    const { error } = await supabaseAdmin
        .from('leaders')
        .delete()
        .eq('id', leaderId);

    if (error) {
        console.error("Error deleting leader from database:", error);
        // Even if DB deletion fails, we don't re-upload the files. The inconsistency will need to be handled manually.
        throw error;
    }
}

export async function deleteRating(userId: string, leaderId: string): Promise<void> {
    const { error } = await supabaseAdmin.rpc('handle_rating_deletion', {
        p_user_id: userId,
        p_leader_id: leaderId
    });

    if (error) {
        console.error("Error deleting rating via RPC:", error);
        throw error;
    }
}
