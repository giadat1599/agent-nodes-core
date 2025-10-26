import z from "zod"
import { PAGINATION } from "../constants"

export const createWorkflowSchema = z.object({
	name: z.string().min(1, "Workflow name is required"),
})

export const updateWorkflowSchema = z.object({
	name: z.string().min(1, "Workflow name is required").optional(),
})

export const getWorkflowsQuerySchema = z.object({
	search_text: z.string().optional(),
	page: z.coerce.number().optional().default(PAGINATION.DEFAULT_PAGE),
	pageSize: z.coerce.number().optional().default(PAGINATION.DEFAULT_PAGE_SIZE),
})
