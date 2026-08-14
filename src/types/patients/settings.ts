import { SubscriptionStatus } from "./subscriptions";

export interface PatientProfile {
  id?: string | number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency?: boolean;
  subscription?: SubscriptionStatus | null;
  [key: string]: any;
}
