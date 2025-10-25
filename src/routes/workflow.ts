/** biome-ignore-all lint/style/noNonNullAssertion: <handled by requireAuth middleware> */

import { and, eq } from "drizzle-orm"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppContext } from "../context"
import { db } from "../drizzle"
import { workflow } from "../drizzle/schemas"
import { requireAuth } from "../middlewares/require-auth"
import { toSuccessResponse } from "../utils/to-success-response"
import { validator } from "../utils/validator"

import { createWorkflowSchema, updateWorkflowSchema } from "../validations/workflow"

export const workflowRouter = new Hono<AppContext>()
	.use("*", requireAuth)
	.get("/", async (c) => {
		const workflows = await db.query.workflow.findMany({
			where: eq(workflow.userId, c.get("user")!.id),
		})

		return toSuccessResponse(workflows, c)
	})
	.get("/:id", async (c) => {
		const userId = c.get("user")!.id
		const workflowId = c.req.param("id")

		const [foundWorkflow] = await db
			.select()
			.from(workflow)
			.where(and(eq(workflow.id, workflowId), eq(workflow.userId, userId)))
			.limit(1)

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
