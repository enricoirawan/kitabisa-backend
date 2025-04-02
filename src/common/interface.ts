export interface TokenPayload {
  userId: number;
}

export interface GoogleUser {
  email: string;
  googleClientId: string;
  username: string;
  photoProfileUrl: string;
}

export interface MidtransNotificationCallbackData {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
}

export interface SendNotificationMessageBody {
  campaignSlug: string;
  userId: number;
  nominal: number;
  message: string;
}
