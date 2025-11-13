import type { NodeType } from "../drizzle/schemas"
import type { NodeExecutor } from "../types/executions"
import { httpRequestExecutor } from "./executors/http-request"
import { manualTriggerExecutor } from "./executors/manual-trigger"

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
	manual_trigger: manualTriggerExecutor,
	initial: manualTriggerExecutor,
	http_request: httpRequestExecutor,
}

export function getExecutor(type: NodeType): NodeExecutor {
	const executor = executorRegistry[type]
	if (!executor) {
		throw new Error(`No executor found for node type: ${type}`)
	}

	return executor
}
