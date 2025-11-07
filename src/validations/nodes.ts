import { z } from "zod"

export const updateNodesSchema = z.object({
	workflowId: z.string().min(1, "Workflow ID is required"),
	nodes: z.array(
		z.object({
			id: z.string().min(1, "Node ID is required"),
			type: z.string().nullish(),
			position: z.object({
				x: z.number(),
				y: z.number(),
			}),
			data: z.record(z.string(), z.any()).optional(),
		}),
	),
	edges: z.array(
		z.object({
			id: z.string().min(1, "Edge ID is required"),
			source: z.string().min(1, "Source node ID is required"),
			target: z.string().min(1, "Target node ID is required"),
			sourceHandle: z.string().nullish(),
			targetHandle: z.string().nullish(),
		}),
	),
})
