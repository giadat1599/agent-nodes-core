import { inngest } from "../client"

interface SendWorkflowExecutionData {
	workflowId: string
	[key: string]: any
}

export async function sendWorkflowExecution(data: SendWorkflowExecutionData) {
	return await inngest.send({
		name: "workflows/execute.workflow",
		data,
	})
}
