/** biome-ignore-all lint/style/noNonNullAssertion: <handled by requireAuth middleware> */

import { and, count, eq, ilike } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppContext } from "../context"
import { db } from "../drizzle"
import { node, workflow } from "../drizzle/schemas"
import { sendWorkflowExecution } from "../inngest/sends/send-workflow-execution"
import { requireAuth } from "../middlewares/require-auth"
import { createPagination } from "../utils/create-pagination"
import { toPaginatedResponse } from "../utils/to-paginated-response"
import { toSuccessResponse } from "../utils/to-success-response"
import { validator } from "../utils/validator"
import { createWorkflowSchema, getWorkflowsQuerySchema, updateWorkflowSchema } from "../validations/workflow"

export const workflowRouter = new Hono<AppContext>()
	.use("*", requireAuth)
	.get("/", validator("query", getWorkflowsQuerySchema), async (c) => {
		const { search_text, page, pageSize } = c.req.valid("query")

		const whereCondition = and(
			eq(workflow.userId, c.get("user")!.id),
			search_text ? ilike(workflow.name, `%${search_text}%`) : undefined,
		)

		const [data, [{ count: totalCount }]] = await Promise.all([
			db.query.workflow.findMany({
				where: and(whereCondition),
				orderBy: (workflow, { desc }) => [desc(workflow.updatedAt), desc(workflow.createdAt)],
				...createPagination(page, pageSize),
			}),
			db.select({ count: count() }).from(workflow).where(whereCondition),
		])

		return toPaginatedResponse(data, { page, pageSize, totalCount }, c)
	})
	.get("/:id", async (c) => {
		const userId = c.get("user")!.id
		const workflowId = c.req.param("id")

		const foundWorkflow = await db.query.workflow.findFirst({
			where: and(eq(workflow.id, workflowId), eq(workflow.userId, userId)),
			with: {
				nodes: true,
				connections: true,
			},
		})

		if (!foundWorkflow) {
			throw new HTTPException(404, { message: "Workflow not found" })
		}

		return toSuccessResponse(foundWorkflow, c)
	})
	.delete("/:id", async (c) => {
		const [deletedWorkflow] = await db
			.delete(workflow)
			.where(and(eq(workflow.id, c.req.param("id")), eq(workflow.userId, c.get("user")!.id)))
			.returning()

		if (!deletedWorkflow) {
			throw new HTTPException(404, { message: "Workflow not found" })
		}

		return toSuccessResponse(deletedWorkflow, c)
	})
	.post("/", validator("json", createWorkflowSchema), async (c) => {
		const { name } = c.req.valid("json")

		const [createdWorkflow] = await db
			.insert(workflow)
			.values({
				name,
				userId: c.get("user")!.id,
			})
			.returning()

		await db.insert(node).values({
			workflowId: createdWorkflow.id,
			type: "initial",
			name: "Initial",
			position: { x: 0, y: 0 },
		})

		return toSuccessResponse(createdWorkflow, c)
	})
	.patch("/:id/update", validator("json", updateWorkflowSchema), async (c) => {
		const [updatedWorkflow] = await db
			.update(workflow)
			.set({
				...c.req.valid("json"),
			})
			.where(and(eq(workflow.id, c.req.param("id")), eq(workflow.userId, c.get("user")!.id)))
			.returning()

		if (!updatedWorkflow) {
			throw new HTTPException(404, { message: "Workflow not found" })
		}

		return toSuccessResponse(updatedWorkflow, c)
	})
	.post("/:id/execute", async (c) => {
		const foundWorkflow = await db.query.workflow.findFirst({
			where: and(eq(workflow.id, c.req.param("id")), eq(workflow.userId, c.get("user")!.id)),
		})

		if (!foundWorkflow) {
			throw new HTTPException(404, { message: "Workflow not found" })
		}

		await sendWorkflowExecution({ workflowId: foundWorkflow.id })

		return toSuccessResponse(foundWorkflow, c)
	})
