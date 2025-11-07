/** biome-ignore-all lint/style/noNonNullAssertion: <handled by requireAuth middleware> */

import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppContext } from "../context"
import { db } from "../drizzle"
import { connection, type NodeType, node, workflow } from "../drizzle/schemas"
import { requireAuth } from "../middlewares/require-auth"
import { toSuccessResponse } from "../utils/to-success-response"
import { validator } from "../utils/validator"
import { updateNodesSchema } from "../validations/nodes"

export const nodeRouter = new Hono<AppContext>()
	.use("*", requireAuth)
	.patch("/", validator("json", updateNodesSchema), async (c) => {
		const { workflowId, nodes, edges } = c.req.valid("json")

		const foundWorkflow = await db.query.workflow.findFirst({
			where: and(eq(workflow.id, workflowId), eq(workflow.userId, c.get("user")!.id)),
		})

		if (!foundWorkflow) {
			throw new HTTPException(404, { message: "Workflow not found" })
		}

		const updatedWorkflow = await db.transaction(async (tx) => {
			await tx.delete(node).where(eq(node.workflowId, workflowId))
			if (nodes && nodes.length > 0) {
				await tx.insert(node).values(
					nodes.map((node) => ({
						id: node.id,
						workflowId: workflowId,
						name: node.type || "Unknown",
						type: node.type as NodeType,
						position: node.position,
						data: node.data || {},
					})),
				)
			}

			if (edges && edges.length > 0) {
				await tx.insert(connection).values(
					edges.map((edge) => ({
						id: edge.id,
						workflowId: workflowId,
						fromNodeId: edge.source,
						toNodeId: edge.target,
						fromOutput: edge.sourceHandle || "main",
						toInput: edge.targetHandle || "main",
					})),
				)
			}

			const [updatedWorkflow] = await tx
				.update(workflow)
				.set({ updatedAt: new Date() })
				.where(eq(workflow.id, workflowId))
				.returning()

			return updatedWorkflow
		})

		return toSuccessResponse(updatedWorkflow, c)
	})
