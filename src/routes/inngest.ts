import { getSubscriptionToken } from "@inngest/realtime"
import { Hono } from "hono"
import { serve } from "inngest/hono"
import type { AppContext } from "../context"
import { httpRequestChannel } from "../inngest/channels/http-request"
import { manualTriggerChannel } from "../inngest/channels/manual-trigger"
import { inngest } from "../inngest/client"
import { executeWorkflow } from "../inngest/functions/execute-workflow"
import { toSuccessResponse } from "../utils/to-success-response"

export const inngestRouter = new Hono<AppContext>()
	.all("/", serve({ client: inngest, functions: [executeWorkflow] }))
	.get("/http-request/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: httpRequestChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
	.get("/manual-trigger/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: manualTriggerChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
