/**
 * useDonate Hook
 * Handles donation creation and checkout flow.
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';

type PaymentMethod = 'mercado_pago' | 'oxxo' | 'spei';

interface CreateDonationParams {
  amount: number;
  paymentMethod: PaymentMethod;
  donorId?: string;
  recurring?: boolean;
}

interface CreateDonationResponse {
  donationId: string;
  checkoutUrl: string;
  externalId: string;
}

interface UseDonateReturn {
  createDonation: (params: CreateDonationParams) => Promise<CreateDonationResponse | null>;
  loading: boolean;
  error: string | null;
}

export function useDonate(): UseDonateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDonation(params: CreateDonationParams): Promise<CreateDonationResponse | null> {
    setLoading(true);
    setError(null);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      // Call create-donation edge function
      const { data, error: functionError } = await supabase.functions.invoke('create-donation', {
        body: {
          amount: params.amount,
          paymentMethod: params.paymentMethod,
          donorId: params.donorId || session?.user?.id,
          recurring: params.recurring || false,
        },
      });

      if (functionError) {
        console.error('Error calling create-donation function:', functionError);
        setError(functionError.message || 'Failed to create donation');
        return null;
      }

      if (!data) {
        setError('No data returned from function');
        return null;
      }

      return {
        donationId: data.donationId,
        checkoutUrl: data.checkoutUrl,
        externalId: data.externalId,
      };
    } catch (err) {
      console.error('Unexpected error in createDonation:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    createDonation,
    loading,
    error,
  };
}
