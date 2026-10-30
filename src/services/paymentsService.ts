import { apiClient } from './apiClient';

export type PaymentMethod = 'mobile_money' | 'card';
export type PaymentState = 'pending' | 'succeeded' | 'failed';

export interface PaymentInitiation {
  payment_id: string;
  reference: string | null;
  external_reference: string;
  amount_gross: string | null;
  amount_net: string | null;
  currency: string;
  status: string;
  checkout_url: string | null;
  instructions: unknown;
  payment_method: PaymentMethod;
  guest_quota: number;
  amount_due: string;
}

export interface EventPaymentStatus {
  event_id: number;
  event_status: 'draft' | 'published' | 'archived';
  payment_status: 'free' | PaymentState;
  total_guests: number;
  paid_guest_quota: number;
  paid_guest_count: number;
  available_credits: number;
  pending_count: number;
  amount_due: string;
  currency: string;
  payment: {
    payment_id: string | null;
    external_reference: string;
    status: PaymentState;
    payment_method: PaymentMethod;
    guest_quota: number;
  } | null;
}

export const paymentsService = {
  createPayment(
    eventId: number,
    payload: {
      guest_quota: number;
      payment_method: PaymentMethod;
      mobilenumber?: string;
    },
  ): Promise<PaymentInitiation> {
    return apiClient.post<PaymentInitiation>(`/events/${eventId}/pay/`, payload);
  },

  getStatus(eventId: number, paymentId?: string): Promise<EventPaymentStatus> {
    const query = paymentId ? `?payment_id=${encodeURIComponent(paymentId)}` : '';
    return apiClient.get<EventPaymentStatus>(
      `/events/${eventId}/payment-status/${query}`,
    );
  },

  grantGuestLink(eventId: number, guestId: number): Promise<{ access_token: string; has_personal_link: boolean }> {
    return apiClient.post<{ access_token: string; has_personal_link: boolean }>(
      `/events/${eventId}/guests/${guestId}/grant-link/`,
    );
  },
};
