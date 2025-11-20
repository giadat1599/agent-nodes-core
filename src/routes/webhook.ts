import { Hono } from "hono"
import type { AppContext } from "../context"
import { sendWorkflowExecution } from "../inngest/sends/send-workflow-execution"
import { toSuccessResponse } from "../utils/to-success-response"
import { validator } from "../utils/validator"
import { googleFormWebhookSchema } from "../validations/webhook"
import { workFlowIdQuerySchema } from "../validations/workflow"

export const webhookRouter = new Hono<AppContext>().post(
	"/google-form",
	validator("query", workFlowIdQuerySchema),
	validator("json", googleFormWebhookSchema),
	async (c) => {
		const workflowId = c.req.valid("query").workflowId
		const formData = c.req.valid("json")

		await sendWorkflowExecution({
			workflowId,
			initialData: {
				googleForm: formData,
			},
		})

		return toSuccessResponse({}, c)
	},
)
