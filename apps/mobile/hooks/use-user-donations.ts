import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Donation {
  amount: number;
  currency: string;
}

interface UseUserDonationsResult {
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

export function useUserDonations(): UseUserDonationsResult {
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTotalAmount(0);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('donations')
        .select('amount, currency')
        .eq('donor_id', user.id);

      if (queryError) {
        console.error('Error fetching donations:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        // Sum all donations (assuming all in MXN for now)
        const total = (data as Donation[]).reduce(
          (sum, donation) => sum + Number(donation.amount),
          0,
        );
        setTotalAmount(total);
      }
    } catch (err) {
      console.error('Unexpected error fetching donations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return {
    totalAmount,
    loading,
    error,
  };
}
