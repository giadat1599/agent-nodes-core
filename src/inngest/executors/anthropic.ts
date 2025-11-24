import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "../../types/executions"
import { anthropicChannel } from "../channels/anthropic"

import Handlebars = require("handlebars")

const AVAILABLE_MODELS = ["claude-sonnet-4-0", "claude-sonnet-4-5"] as const

type AnthropicData = {
	variableName: string
	model: (typeof AVAILABLE_MODELS)[number]
	systemPrompt: string
	userPrompt: string
}

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({ context, step, publish, nodeId, data }) => {
	await publish(
		anthropicChannel().status({
			nodeId,
			status: "loading",
		}),
	)
	try {
		if (!data.model) {
			throw new NonRetriableError("No model provided for Anthropic executor")
		}

		if (!data.variableName) {
			throw new NonRetriableError("No variableName provided for Anthropic executor")
		}

		if (!data.userPrompt) {
			throw new NonRetriableError("No userPrompt provided for Anthropic executor")
		}

		const result = await step.run("anthropic", async () => {
			const resolved = Handlebars.compile(data.userPrompt || "{}")(context)
			const { steps } = await generateText({
				model: anthropic(data.model || "claude-sonnet-4-0"),
				system: data.systemPrompt || undefined,
				prompt: resolved,
			})

			const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : ""

			await publish(
				anthropicChannel().status({
					nodeId,
					status: "success",
				}),
			)
			return {
				...context,
				[data.variableName]: { aiResponse: text },
			}
		})

		return result
	} catch (error) {
		await publish(
			anthropicChannel().status({
				nodeId,
				status: "error",
			}),
		)
		throw error
	}
}
