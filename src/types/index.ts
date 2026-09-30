export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  customerProfile?: CustomerProfile | null;
  technicianProfile?: TechnicianProfile | null;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | string | null;
  isAvailable: boolean;
  baseLatitude?: number | null;
  baseLongitude?: number | null;
  skills?: TechnicianSkill[];
  user?: User;
}

export interface Skill {
  id: string;
  name: string;
  description?: string | null;
}

export interface TechnicianSkill {
  id: string;
  technicianId: string;
  skillId: string;
  proficiency?: string | null;
  skill?: Skill;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  serviceTypes?: ServiceType[];
}

export interface ServiceType {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice: number | string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
}

export type ServiceRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'INVOICED'
  | 'CLOSED'
  | 'CANCELLED';

export interface ServiceRequest {
  id: string;
  customerId: string;
  serviceTypeId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  preferredDateTime?: string | null;
  status: ServiceRequestStatus;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email: string };
  serviceType?: ServiceType;
  assignments?: Assignment[];
}

export type AssignmentStatus =
  | 'SCHEDULED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Assignment {
  id: string;
  serviceRequestId: string;
  technicianId: string;
  managerId: string;
  status: AssignmentStatus;
  technicianNotes?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  serviceRequest?: ServiceRequest;
  technician?: TechnicianProfile;
  workOrder?: WorkOrder;
  schedule?: Schedule;
}

export interface Schedule {
  id: string;
  assignmentId: string;
  technicianId: string;
  startAt: string;
  endAt: string;
  cancelledAt?: string | null;
}

export type WorkOrderStatus =
  | 'SCHEDULED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface WorkOrder {
  id: string;
  assignmentId: string;
  status: WorkOrderStatus;
  arrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  serviceReport?: ServiceReport | null;
  invoice?: Invoice | null;
  feedback?: Feedback | null;
}

export interface ServiceReport {
  id: string;
  workOrderId: string;
  technicianId: string;
  summary?: string | null;
  findings?: string | null;
  actionsTaken?: string | null;
  beforeImages?: string[];
  afterImages?: string[];
  createdAt: string;
  updatedAt: string;
  workOrder?: WorkOrder;
  technician?: TechnicianProfile;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number | string;
  amount: number | string;
}

export interface Invoice {
  id: string;
  workOrderId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalAmount: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  dueAmount: number | string;
  currency: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  workOrder?: WorkOrder;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  status: PaymentStatus;
  provider: string;
  providerSessionId?: string | null;
  providerPaymentId?: string | null;
  amount: number | string;
  currency: string;
  failureReason?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: Invoice;
}

export interface Feedback {
  id: string;
  workOrderId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface DashboardStats {
  totalCustomers: number;
  totalTechnicians: number;
  totalServiceRequests: number;
  pendingRequests: number;
  activeJobs: number;
  completedJobs: number;
  totalInvoices: number;
  paidInvoices: number;
  totalRevenue: number | string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
  };
}
