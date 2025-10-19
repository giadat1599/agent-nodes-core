import { Hono } from "hono"
import type { Context } from "../context"
import { db } from "../drizzle"
import { inngest } from "../inngest/client"
import { requireAuth } from "../middlewares/require-auth"

export const workflowRouter = new Hono<Context>()
	.use("*", requireAuth)
	.get("/", async (c) => {
		const workflows = await db.query.workflow.findMany()
		return c.json(workflows)
	})
	.post("/", async (c) => {
		await inngest.send({
			name: "test/hello.world",
			data: {
				email: "hello@example.com",
			},
		})
		return c.json({ message: "Workflow creation started" })
	})
