import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["CUSTOMER", "TECHNICIAN"]).default("CUSTOMER"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const serviceRequestSchema = z
  .object({
    categoryId: z.string().min(1, "Please select a service category"),
    serviceTypeId: z.string().optional(),
    customServiceTypeName: z.string().optional(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    location: z.string().min(2, "Location is required"),
    preferredDateTime: z.string().min(1, "Preferred date & time is required"),
  })
  .refine(
    (data) =>
      Boolean(data.serviceTypeId) ||
      Boolean(data.customServiceTypeName && data.customServiceTypeName.trim().length >= 2),
    {
      message: "Please select a service type or type your specific service requirement",
      path: ["serviceTypeId"],
    }
  );

export const reviewRequestSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  serviceRequestId: z.string().min(1, "Service request ID is required"),
  technicianId: z.string().min(1, "Please select a technician"),
  scheduledStartAt: z.string().min(1, "Scheduled start time is required"),
  scheduledEndAt: z.string().min(1, "Scheduled end time is required"),
  technicianNotes: z.string().optional(),
});

export const updateWorkOrderStatusSchema = z.object({
  status: z.enum(["ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
});

export const serviceReportSchema = z
  .object({
    summary: z.string().optional(),
    findings: z.string().optional(),
    actionsTaken: z.string().optional(),
  })
  .refine((data) => data.summary || data.findings || data.actionsTaken, {
    message: "At least one report field (summary, findings, or actions) is required",
  });

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
});

export const generateInvoiceSchema = z.object({
  items: z.array(invoiceItemSchema).min(1, "At least one invoice item is required"),
  taxAmount: z.coerce.number().nonnegative().default(0),
  discountAmount: z.coerce.number().nonnegative().default(0),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const technicianAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;
export type AssignTechnicianFormData = z.infer<typeof assignTechnicianSchema>;
export type ServiceReportFormData = z.infer<typeof serviceReportSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type GenerateInvoiceFormData = z.infer<typeof generateInvoiceSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
