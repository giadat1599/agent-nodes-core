import { getSubscriptionToken } from "@inngest/realtime"
import { Hono } from "hono"
import { serve } from "inngest/hono"
import type { AppContext } from "../context"
import { anthropicChannel } from "../inngest/channels/anthropic"
import { geminiChannel } from "../inngest/channels/gemini"
import { googleFormTriggerChannel } from "../inngest/channels/google-form-trigger"
import { httpRequestChannel } from "../inngest/channels/http-request"
import { manualTriggerChannel } from "../inngest/channels/manual-trigger"
import { openaiChannel } from "../inngest/channels/openai"
import { inngest } from "../inngest/client"
import { executeWorkflow } from "../inngest/functions/execute-workflow"
import { toSuccessResponse } from "../utils/to-success-response"

export const inngestRouter = new Hono<AppContext>()
	.all("/", serve({ client: inngest, functions: [executeWorkflow] }))
	.get("/executors/http-request/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: httpRequestChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
	.get("/executors/manual-trigger/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: manualTriggerChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
	.get("/executors/google-form-trigger/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: googleFormTriggerChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
	.get("/executors/openai/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: openaiChannel(),
			topics: ["status"],
		})

		return toSuccessResponse({ token }, c)
	})
	.get("/executors/anthropic/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: anthropicChannel(),
			topics: ["status"],
		})
		return toSuccessResponse({ token }, c)
	})
	.get("/executors/gemini/refresh-token", async (c) => {
		const token = await getSubscriptionToken(inngest, {
			channel: geminiChannel(),
			topics: ["status"],
		})
		return toSuccessResponse({ token }, c)
	})
