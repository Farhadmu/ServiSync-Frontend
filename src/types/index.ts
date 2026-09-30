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
  createdAt?: string;
  updatedAt?: string;
  serviceTypes?: ServiceType[];
  services?: any[];
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
  | 'PAID'
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
  customer?: { id: string; name: string; email: string; phone?: string | null };
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

// ──────────────────────────────────────────────────────────────────────
// WEBSITE CONTENT (CMS)
// ──────────────────────────────────────────────────────────────────────

export interface WebsiteSection<T = any> {
  id: string;
  sectionKey: string;
  title?: string | null;
  subtitle?: string | null;
  order: number;
  isVisible: boolean;
  isPublished: boolean;
  content: T;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublishedContentResponse {
  sections: WebsiteSection[];
  sectionMap: Record<string, WebsiteSection>;
}

export interface HeroMetric {
  label: string;
  value: string;
  description: string;
}

export interface HeroContent {
  badgeText?: string;
  highlightedText?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  metrics?: HeroMetric[];
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  tag?: string;
}

export interface FeaturesContent {
  badge?: string;
  items: FeatureItem[];
}

export interface WorkflowStep {
  stepNumber: string;
  title: string;
  role: string;
  description: string;
  icon: string;
}

export interface WorkflowContent {
  badge?: string;
  steps: WorkflowStep[];
}

export interface RoleOverviewItem {
  role: string;
  tagline: string;
  description?: string;
  bullets: string[];
}

export interface RolesContent {
  badge?: string;
  roles: RoleOverviewItem[];
}

export interface ShowcaseTab {
  id: string;
  label: string;
  heading: string;
  description: string;
  highlights: string[];
}

export interface ShowcaseContent {
  badge?: string;
  tabs: ShowcaseTab[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FaqContent {
  badge?: string;
  items: FaqItem[];
}

export interface CtaContent {
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  companyName?: string;
  tagline?: string;
  copyright?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  links?: FooterLink[];
}

// ──────────────────────────────────────────────────────────────────────
// CUSTOMER EXPERIENCE ENHANCEMENTS
// ──────────────────────────────────────────────────────────────────────

export interface CustomerAddress {
  id: string;
  userId: string;
  label: 'HOME' | 'OFFICE' | 'OTHER';
  address: string;
  city?: string | null;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupportTicketCategory =
  | 'BOOKING_ISSUE'
  | 'TECHNICIAN_ISSUE'
  | 'BILLING_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'OTHER';

export type SupportTicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  isStaffReply: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    role: UserRole;
    image?: string | null;
  };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  serviceRequestId?: string | null;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  customer?: { id: string; name: string; email: string; image?: string | null };
  serviceRequest?: { id: string; title: string; status: ServiceRequestStatus; location?: string | null };
  messages?: SupportTicketMessage[];
  _count?: { messages: number };
}

export type QuoteStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'CHANGE_REQUESTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ServiceQuote {
  id: string;
  serviceRequestId: string;
  quoteNumber: string;
  version: number;
  status: QuoteStatus;
  items?: QuoteItem[] | null;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  totalAmount: number | string;
  currency: string;
  notes?: string | null;
  expiresAt?: string | null;
  customerResponseAt?: string | null;
  customerComment?: string | null;
  createdAt: string;
  updatedAt: string;
  serviceRequest?: {
    id: string;
    title: string;
    status: ServiceRequestStatus;
    serviceType?: { name: string };
  };
}

export interface AppointmentSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
  remainingSlots: number;
  reason?: string;
}

export interface TimelineStage {
  key: string;
  label: string;
  isCompleted: boolean;
  isCurrent?: boolean;
  timestamp?: string;
  meta?: any;
}

export interface TimelineEvent {
  id: string;
  stage: string;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  role?: string;
}

export interface PublicTechnicianProfile {
  id: string;
  userId: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  experienceYears?: number;
  skills: { id: string; name: string; proficiency: string }[];
  stats: {
    completedJobs: number;
    totalReviews: number;
    averageRating: number;
  };
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    customerName: string;
    customerImage?: string | null;
  }[];
}


