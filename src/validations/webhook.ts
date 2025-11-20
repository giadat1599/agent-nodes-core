import z from "zod"

export const googleFormWebhookSchema = z.object({
	formId: z.string().min(1, "Form ID is required"),
	formTitle: z.string().min(1, "Form title is required"),
	responseId: z.string().min(1, "Response ID is required"),
	timestamp: z.string().min(1, "Timestamp is required"),
	respondentEmail: z.string().optional(),
	responses: z.record(z.string(), z.string()),
	raw: z.any().optional(),
})
