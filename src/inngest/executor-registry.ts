import type { NodeType } from "../drizzle/schemas"
import type { NodeExecutor } from "../types/executions"
import { anthropicExecutor } from "./executors/anthropic"
import { geminiExecutor } from "./executors/gemini"
import { googleFormTriggerExecutor } from "./executors/google-form-trigger"
import { httpRequestExecutor } from "./executors/http-request"
import { manualTriggerExecutor } from "./executors/manual-trigger"
import { openaiExecutor } from "./executors/openai"

export const executorRegistry: Record<NodeType, NodeExecutor<any>> = {
	manual_trigger: manualTriggerExecutor,
	initial: manualTriggerExecutor,
	http_request: httpRequestExecutor,
	google_form_trigger: googleFormTriggerExecutor,
	openai: openaiExecutor,
	gemini: geminiExecutor,
	anthropic: anthropicExecutor,
}

export function getExecutor(type: NodeType): NodeExecutor {
	const executor = executorRegistry[type]
	if (!executor) {
		throw new Error(`No executor found for node type: ${type}`)
	}

	return executor
}
