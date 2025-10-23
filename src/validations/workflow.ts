import z from "zod"

export const createWorkflowSchema = z.object({
	name: z.string().min(1, "Workflow name is required"),
})

export const updateWorkflowSchema = z.object({
	name: z.string().min(1, "Workflow name is required").optional(),
})
