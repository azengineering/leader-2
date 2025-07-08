
'use server';

import { supabase } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type PollQuestionType = 'yes_no' | 'multiple_choice';

export interface PollOption {
  id: string;
  question_id: string;
  option_text: string;
  option_order: number;
}

export interface PollQuestion {
  id: string;
  poll_id: string;
  question_text: string;
  question_type: PollQuestionType;
  question_order: number;
  options: PollOption[];
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  active_until: string | null;
  created_at: string;
  target_filters: PollTargetFilters | null;
  questions: PollQuestion[];
}

export interface PollTargetFilters {
  states?: string[];
  constituencies?: string[];
  gender?: string[];
  age_min?: number;
  age_max?: number;
}

export interface PollListItem {
  id: string;
  title: string;
  is_active: boolean;
  active_until: string | null;
  created_at: string;
  response_count: number;
  is_promoted?: boolean;
  target_filters?: PollTargetFilters | null;
}

export interface CreatePollData {
  title: string;
  description?: string;
  is_active: boolean;
  active_until?: string;
  target_filters?: PollTargetFilters;
  questions: CreatePollQuestionData[];
}

export interface CreatePollQuestionData {
  question_text: string;
  question_type: PollQuestionType;
  options: string[];
}

export interface PollResult {
  pollTitle: string;
  totalResponses: number;
  genderDistribution: { name: string; value: number }[];
  questions: {
    id: string;
    text: string;
    answers: { name: string; value: number }[];
  }[];
}

export interface PollForParticipation {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  active_until: string | null;
  created_at: string;
  user_has_voted: boolean;
  questions: PollQuestion[];
}

export interface PollAnswer {
  questionId: string;
  optionId: string;
}

export async function getPollsForAdmin(): Promise<PollListItem[]> {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_admin_polls');

    if (error) {
      console.error('Error fetching polls for admin:', error);
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPollsForAdmin:', error);
    throw new Error('Failed to fetch polls');
  }
}

export async function getActivePollsForUser(userId: string | null): Promise<(PollListItem & { user_has_voted: boolean; description: string | null; })[]> {
  try {
    const { data, error } = await supabase.rpc('get_active_polls_for_user', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching active polls for user:', error);
      throw new Error(`Failed to fetch active polls: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActivePollsForUser:', error);
    throw new Error('Failed to fetch active polls');
  }
}

export async function getPollForParticipation(pollId: string, userId: string | null): Promise<PollForParticipation | null> {
  try {
    if (!pollId) {
      throw new Error('Poll ID is required');
    }

    // First check if the poll exists and is active
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .eq('is_active', true)
      .single();

    if (pollError) {
      if (pollError.code === 'PGRST116') {
        return null; // Poll not found or not active
      }
      console.error('Error fetching poll for participation:', pollError);
      throw new Error(`Failed to fetch poll: ${pollError.message}`);
    }

    // Check if poll is still active (not expired)
    if (pollData.active_until && new Date(pollData.active_until) <= new Date()) {
      return null; // Poll has expired
    }

    // Check if user has already voted
    let userHasVoted = false;
    if (userId) {
      const { data: responseData, error: responseError } = await supabase
        .from('poll_responses')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (responseError && responseError.code !== 'PGRST116') {
        console.error('Error checking user vote status:', responseError);
        throw new Error(`Failed to check vote status: ${responseError.message}`);
      }

      userHasVoted = !!responseData;
    }

    // Get poll questions and options
    const { data: questionsData, error: questionsError } = await supabase
      .from('poll_questions')
      .select(`
        *,
        poll_options (*)
      `)
      .eq('poll_id', pollId)
      .order('question_order');

    if (questionsError) {
      console.error('Error fetching poll questions:', questionsError);
      throw new Error(`Failed to fetch poll questions: ${questionsError.message}`);
    }

    const questions: PollQuestion[] = (questionsData || []).map(q => ({
      id: q.id,
      poll_id: q.poll_id,
      question_text: q.question_text,
      question_type: q.question_type,
      question_order: q.question_order,
      options: (q.poll_options || []).sort((a: any, b: any) => a.option_order - b.option_order),
    }));

    return {
      id: pollData.id,
      title: pollData.title,
      description: pollData.description,
      is_active: pollData.is_active,
      active_until: pollData.active_until,
      created_at: pollData.created_at,
      user_has_voted: userHasVoted,
      questions,
    };
  } catch (error) {
    console.error('Error in getPollForParticipation:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch poll for participation');
  }
}

export async function getPollById(pollId: string): Promise<Poll | null> {
  try {
    if (!pollId) {
      throw new Error('Poll ID is required');
    }

    const { data: pollData, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();

    if (pollError) {
      if (pollError.code === 'PGRST116') {
        return null; // Poll not found
      }
      console.error('Error fetching poll:', pollError);
      throw new Error(`Failed to fetch poll: ${pollError.message}`);
    }

    const { data: questionsData, error: questionsError } = await supabaseAdmin
      .from('poll_questions')
      .select(`
        *,
        poll_options (*)
      `)
      .eq('poll_id', pollId)
      .order('question_order');

    if (questionsError) {
      console.error('Error fetching poll questions:', questionsError);
      throw new Error(`Failed to fetch poll questions: ${questionsError.message}`);
    }

    const questions: PollQuestion[] = (questionsData || []).map(q => ({
      id: q.id,
      poll_id: q.poll_id,
      question_text: q.question_text,
      question_type: q.question_type,
      question_order: q.question_order,
      options: (q.poll_options || []).sort((a: any, b: any) => a.option_order - b.option_order),
    }));

    return {
      ...pollData,
      questions,
    };
  } catch (error) {
    console.error('Error in getPollById:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch poll');
  }
}

export async function createPoll(pollData: CreatePollData): Promise<string> {
  try {
    // Validate required fields
    if (!pollData.title?.trim()) {
      throw new Error('Poll title is required');
    }
    if (!pollData.questions || pollData.questions.length === 0) {
      throw new Error('At least one question is required');
    }

    // Validate questions
    for (const question of pollData.questions) {
      if (!question.question_text?.trim()) {
        throw new Error('Question text is required');
      }
      if (!question.options || question.options.length < 2) {
        throw new Error('Each question must have at least 2 options');
      }
    }

    // Validate active_until date
    if (pollData.active_until) {
      const activeUntil = new Date(pollData.active_until);
      const now = new Date();
      if (activeUntil <= now) {
        throw new Error('Active until date must be in the future');
      }
    }

    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        title: pollData.title.trim(),
        description: pollData.description?.trim() || null,
        is_active: pollData.is_active,
        active_until: pollData.active_until || null,
        target_filters: pollData.target_filters || null,
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      throw new Error(`Failed to create poll: ${pollError.message}`);
    }

    // Create questions and options
    for (let i = 0; i < pollData.questions.length; i++) {
      const questionData = pollData.questions[i];
      
      const { data: question, error: questionError } = await supabaseAdmin
        .from('poll_questions')
        .insert({
          poll_id: poll.id,
          question_text: questionData.question_text.trim(),
          question_type: questionData.question_type,
          question_order: i + 1,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error creating poll question:', questionError);
        throw new Error(`Failed to create poll question: ${questionError.message}`);
      }

      // Create options
      const optionsToInsert = questionData.options.map((optionText, index) => ({
        question_id: question.id,
        option_text: optionText.trim(),
        option_order: index + 1,
      }));

      const { error: optionsError } = await supabaseAdmin
        .from('poll_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Error creating poll options:', optionsError);
        throw new Error(`Failed to create poll options: ${optionsError.message}`);
      }
    }

    return poll.id;
  } catch (error) {
    console.error('Error in createPoll:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create poll');
  }
}

export async function updatePoll(pollId: string, updates: Partial<CreatePollData>): Promise<void> {
  try {
    if (!pollId) {
      throw new Error('Poll ID is required');
    }

    // Validate updates
    if (updates.title !== undefined && !updates.title?.trim()) {
      throw new Error('Poll title cannot be empty');
    }

    if (updates.active_until) {
      const activeUntil = new Date(updates.active_until);
      const now = new Date();
      if (activeUntil <= now) {
        throw new Error('Active until date must be in the future');
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null;
    }
    if (updates.is_active !== undefined) {
      updateData.is_active = updates.is_active;
    }
    if (updates.active_until !== undefined) {
      updateData.active_until = updates.active_until || null;
    }
    if (updates.target_filters !== undefined) {
      updateData.target_filters = updates.target_filters || null;
    }

    const { error } = await supabaseAdmin
      .from('polls')
      .update(updateData)
      .eq('id', pollId);

    if (error) {
      console.error('Error updating poll:', error);
      throw new Error(`Failed to update poll: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updatePoll:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update poll');
  }
}

export async function deletePoll(pollId: string): Promise<void> {
  try {
    if (!pollId) {
      throw new Error('Poll ID is required');
    }

    // Delete in correct order due to foreign key constraints
    // First delete poll_responses
    const { error: responsesError } = await supabaseAdmin
      .from('poll_responses')
      .delete()
      .eq('poll_id', pollId);

    if (responsesError) {
      console.error('Error deleting poll responses:', responsesError);
      throw new Error(`Failed to delete poll responses: ${responsesError.message}`);
    }

    // Get question IDs first, then delete poll_options
    const { data: questionIds, error: questionIdsError } = await supabaseAdmin
      .from('poll_questions')
      .select('id')
      .eq('poll_id', pollId);

    if (questionIdsError) {
      console.error('Error fetching question IDs:', questionIdsError);
      throw new Error(`Failed to fetch question IDs: ${questionIdsError.message}`);
    }

    if (questionIds && questionIds.length > 0) {
      const { error: optionsError } = await supabaseAdmin
        .from('poll_options')
        .delete()
        .in('question_id', questionIds.map(q => q.id));

      if (optionsError) {
        console.error('Error deleting poll options:', optionsError);
        throw new Error(`Failed to delete poll options: ${optionsError.message}`);
      }
    }

    

    // Then delete poll_questions
    const { error: questionsError } = await supabaseAdmin
      .from('poll_questions')
      .delete()
      .eq('poll_id', pollId);

    if (questionsError) {
      console.error('Error deleting poll questions:', questionsError);
      throw new Error(`Failed to delete poll questions: ${questionsError.message}`);
    }

    // Finally delete the poll
    const { error: pollError } = await supabaseAdmin
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (pollError) {
      console.error('Error deleting poll:', pollError);
      throw new Error(`Failed to delete poll: ${pollError.message}`);
    }
  } catch (error) {
    console.error('Error in deletePoll:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete poll');
  }
}

export async function submitPollResponse(pollId: string, userId: string, answers: PollAnswer[]): Promise<void> {
  try {
    if (!pollId || !userId || !answers || answers.length === 0) {
      throw new Error('Poll ID, user ID, and answers are required');
    }

    // Verify poll exists and is active
    const poll = await getPollForParticipation(pollId, userId);
    if (!poll) {
      throw new Error('Poll not found or not active');
    }

    if (poll.user_has_voted) {
      throw new Error('You have already voted on this poll');
    }

    // Validate answers
    const questionIds = poll.questions.map(q => q.id);
    const answerQuestionIds = answers.map(a => a.questionId);
    
    if (answerQuestionIds.length !== questionIds.length) {
      throw new Error('All questions must be answered');
    }

    for (const answer of answers) {
      if (!questionIds.includes(answer.questionId)) {
        throw new Error('Invalid question ID in answer');
      }
    }

    // Convert answers to the format expected by the database
    const answersJson = answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.optionId;
      return acc;
    }, {} as Record<string, string>);

    // Submit response
    const { error } = await supabase
      .from('poll_responses')
      .insert({
        poll_id: pollId,
        user_id: userId,
        answers: answersJson,
      });

    if (error) {
      console.error('Error submitting poll response:', error);
      throw new Error(`Failed to submit poll response: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in submitPollResponse:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to submit poll response');
  }
}

export async function getPollResults(pollId: string): Promise<PollResult | null> {
  try {
    if (!pollId) {
      throw new Error('Poll ID is required');
    }

    const poll = await getPollById(pollId);
    if (!poll) {
      return null;
    }

    // Get total responses
    const { count: totalResponses, error: countError } = await supabaseAdmin
      .from('poll_responses')
      .select('*', { count: 'exact', head: true })
      .eq('poll_id', pollId);

    if (countError) {
      console.error('Error counting poll responses:', countError);
      throw new Error(`Failed to count poll responses: ${countError.message}`);
    }

    // Get demographic data with better error handling
    const { data: demographicData, error: demoError } = await supabaseAdmin
      .from('poll_responses')
      .select(`
        users!inner(
          gender,
          age,
          mpConstituency,
          state
        )
      `)
      .eq('poll_id', pollId);

    if (demoError) {
      console.error('Error fetching demographic data:', demoError);
      // Continue with basic gender distribution if detailed demographics fail
    }

    // Process gender distribution
    const genderCounts: { [key: string]: number } = {};
    demographicData?.forEach((response: any) => {
      const gender = response.users?.gender || 'Not specified';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    const genderDistribution = Object.entries(genderCounts).map(([name, value]) => ({
      name: name === 'Not specified' ? 'Unknown' : name,
      value,
    }));

    // If no demographic data, create default unknown entry
    if (genderDistribution.length === 0 && totalResponses && totalResponses > 0) {
      genderDistribution.push({ name: 'Unknown', value: totalResponses });
    }

    // Get question results with improved data handling
    const questionResults = [];
    for (const question of poll.questions) {
      // Get all responses for this question using the answers JSON field
      const { data: responseData, error: responseError } = await supabaseAdmin
        .from('poll_responses')
        .select('answers')
        .eq('poll_id', pollId);

      if (responseError) {
        console.error('Error fetching poll responses:', responseError);
        continue;
      }

      // Count answers for this specific question
      const answerCounts: { [key: string]: number } = {};
      
      responseData?.forEach((response: any) => {
        const answers = response.answers || {};
        const selectedOptionId = answers[question.id];
        
        if (selectedOptionId) {
          // Find the option text from the question's options
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          const optionText = selectedOption?.option_text || 'Unknown Option';
          answerCounts[optionText] = (answerCounts[optionText] || 0) + 1;
        }
      });

      // Ensure all options are represented, even with 0 votes
      question.options.forEach(option => {
        if (!(option.option_text in answerCounts)) {
          answerCounts[option.option_text] = 0;
        }
      });

      questionResults.push({
        id: question.id,
        text: question.question_text,
        answers: Object.entries(answerCounts).map(([name, value]) => ({
          name,
          value,
        })),
      });
    }

    return {
      pollTitle: poll.title,
      totalResponses: totalResponses || 0,
      genderDistribution,
      questions: questionResults,
    };
  } catch (error) {
    console.error('Error in getPollResults:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch poll results');
  }
}
