import { eq } from "drizzle-orm"
import { NonRetriableError } from "inngest"
import { db } from "../../drizzle"
import { workflow } from "../../drizzle/schemas"
import { topologicalSort } from "../../utils/topological-sort"
import { inngest } from "../client"
import { getExecutor } from "../executor-registry"

export const executeWorkflow = inngest.createFunction(
	{ id: "execute-workflow", retries: 0 },
	{ event: "workflows/execute.workflow" },
	async ({ step, event, publish }) => {
		const workflowId = event.data?.workflowId

		if (!workflowId) {
			throw new NonRetriableError("No workflow ID provided")
		}

		const sortedNodes = await step.run("fetch-nodes", async () => {
			const foundWorkflow = await db.query.workflow.findFirst({
				where: eq(workflow.id, workflowId),
				with: {
					nodes: true,
					connections: true,
				},
			})

			if (!foundWorkflow) {
				throw new Error("Workflow not found")
			}

			return topologicalSort(foundWorkflow.nodes, foundWorkflow.connections)
		})

		// Initialize the context with any initial data from the trigger
		let context = event.data?.initialData || {}

		// Execute each node in topological order
		for (const node of sortedNodes) {
			const executor = getExecutor(node.type)
			context = await executor({
				data: node.data as Record<string, unknown>,
				nodeId: node.id,
				context,
				step,
				publish,
			})
		}
		return {
			workflowId,
			result: context,
		}
	},
)
