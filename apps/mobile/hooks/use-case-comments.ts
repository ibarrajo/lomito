/**
 * Hook for fetching and posting case comments.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CaseComment {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface RawCommentRow {
  id: string;
  body: string;
  created_at: string;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface UseCaseCommentsResult {
  comments: CaseComment[];
  loading: boolean;
  posting: boolean;
  postComment: (body: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export function useCaseComments(caseId: string): UseCaseCommentsResult {
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!caseId) return;

    try {
      const { data, error } = await supabase
        .from('case_comments')
        .select(
          'id, body, created_at, author:profiles!author_id(id, full_name, avatar_url)',
        )
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch comments:', error);
        return;
      }

      if (data) {
        const rows = data as unknown as RawCommentRow[];
        const mapped: CaseComment[] = rows.map((row) => ({
          id: row.id,
          body: row.body,
          created_at: row.created_at,
          author: row.author ?? { id: '', full_name: null, avatar_url: null },
        }));
        setComments(mapped);
      }
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = useCallback(
    async (body: string) => {
      if (!caseId || !body.trim()) return;

      setPosting(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('AUTH_REQUIRED');

        const { error } = await supabase.from('case_comments').insert({
          case_id: caseId,
          author_id: user.id,
          body: body.trim(),
        });

        if (error) {
          console.error('Failed to post comment:', error);
          throw error;
        }

        // Refetch to get the comment with author data
        await fetchComments();
      } finally {
        setPosting(false);
      }
    },
    [caseId, fetchComments],
  );

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await supabase
      .from('case_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return { comments, loading, posting, postComment, deleteComment };
}
