export interface SubscriptionPlan {
  id?: string | number;
  name: string;
  price: number | string;
  interval: string;
  description: string;
  features: string[];
  paystack_plan_code?: string;
}

export interface SubscriptionStatus {
  status: 'active' | 'non-renewing' | 'attention' | 'past_due' | 'cancelled' | 'canceled' | 'completed' | 'expired' | 'inactive';
  plan_name: string;
  [key: string]: any;
}
