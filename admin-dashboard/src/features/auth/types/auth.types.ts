// Auth Types - متطابقة مع الباك إند

export interface SendOtpDto {
  phone: string;
  context?: 'register' | 'reset';
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  capabilityRequest?: 'engineer' | 'wholesale';
  jobTitle?: string;
  deviceId?: string;
}

export interface ForgotPasswordDto {
  phone: string;
}

export interface ResetPasswordDto {
  phone: string;
  code: string;
  newPassword: string;
}

export interface SetPasswordDto {
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    tokens: {
      access: string;
      refresh: string;
    };
    me: {
      id: string;
      phone: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
      isAdmin?: boolean;
    };
  };
  meta: any;
  requestId: any;
}

export interface UserProfile {
  user: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    jobTitle?: string;
    isAdmin: boolean;
  };
  capabilities?: {
    customer_capable?: boolean;
    engineer_capable?: boolean;
    engineer_status?: string;
    wholesale_capable?: boolean;
    wholesale_status?: string;
    wholesale_discount_percent?: number;
  };
}
