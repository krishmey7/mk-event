import { apiClient } from './apiClient';

export type PayoutCurrency = 'USD' | 'CDF';

export interface AdminWalletTransaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'incoming_payment';
  created_at: string;
  status: 'pending' | 'succeeded' | 'failed';
  user_id: number;
  user_name: string;
  amount: string;
  fee: string;
  amount_debited: string;
  currency: PayoutCurrency;
  share_percent: string | null;
  external_reference: string;
  provider_reference: string;
  account: string;
  event_name: string;
}

export interface AdminWalletDashboard {
  is_superuser: boolean;
  share_percent: string;
  balances: Record<PayoutCurrency, string>;
  transactions: AdminWalletTransaction[];
  has_more: boolean;
  next_page: number | null;
  admin_balances: Array<{
    user_id: number;
    user_name: string;
    share_percent: string;
    USD: string;
    CDF: string;
  }>;
}

export interface AdminWithdrawalResult {
  external_reference: string;
  provider_withdrawal_id: string;
  status: string;
  amount: string;
  fee: string;
  amount_debited: string;
  currency: PayoutCurrency;
  account: string;
}

export const adminWalletService = {
  getDashboard(page = 1): Promise<AdminWalletDashboard> {
    return apiClient.get<AdminWalletDashboard>(`/admin/wallet/?page=${page}`);
  },

  withdraw(payload: {
    amount: string;
    currency: PayoutCurrency;
    account: string;
  }): Promise<AdminWithdrawalResult> {
    return apiClient.post<AdminWithdrawalResult>('/admin/wallet/withdrawals/', payload);
  },
};
