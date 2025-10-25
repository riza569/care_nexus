export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "carer";
  phone?: string;
}

export interface Client {
  id: number;
  name: string;
  dob?: string;
  address?: string;
  medical_info?: string;
  emergency_contact?: string;
  created_by?: number;
  created_at: string;
}

export interface Schedule {
  id: number;
  client: Client;
  carer: number;
  carer_name: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: "pending" | "completed" | "cancelled";
}

export interface ScheduleFormData {
  client: number;
  carer: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: "pending" | "completed" | "cancelled";
}

export interface LeaveRequest {
  id: number;
  carer: User;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface LeaveFormData {
  start_date: string;
  end_date: string;
  reason: string;
}

export interface CarerFormData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface ClientFormData {
  name: string;
  dob?: string;
  address?: string;
  medical_info?: string;
  emergency_contact?: string;
}

export interface DashboardStats {
  total_clients?: number;
  total_carers?: number;
  total_schedules?: number;
  pending_leave?: number;
  today_schedules?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface ApiError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
}
