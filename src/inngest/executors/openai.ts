import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "../../types/executions"
import { openaiChannel } from "../channels/openai"

import Handlebars = require("handlebars")

const AVAILABLE_MODELS = ["gpt-4", "gpt-4o", "gpt-4.1", "gpt-5"] as const

type OpenAIData = {
	variableName: string
	model: (typeof AVAILABLE_MODELS)[number]
	systemPrompt: string
	userPrompt: string
}

export const openaiExecutor: NodeExecutor<OpenAIData> = async ({ context, step, publish, nodeId, data }) => {
	await publish(
		openaiChannel().status({
			nodeId,
			status: "loading",
		}),
	)
	try {
		if (!data.model) {
			throw new NonRetriableError("No model provided for OpenAI executor")
		}

		if (!data.variableName) {
			throw new NonRetriableError("No variableName provided for OpenAI executor")
		}

		if (!data.userPrompt) {
			throw new NonRetriableError("No userPrompt provided for OpenAI executor")
		}

		const result = await step.run("openai", async () => {
			const resolved = Handlebars.compile(data.userPrompt || "{}")(context)
			const { steps } = await generateText({
				model: openai(data.model || "gpt-4"),
				system: data.systemPrompt || undefined,
				prompt: resolved,
			})

			await publish(
				openaiChannel().status({
					nodeId,
					status: "success",
				}),
			)

			const text = steps[0].content[0].type === "text" ? steps[0].content[0].text : ""
			return {
				...context,
				[data.variableName]: { aiResponse: text },
			}
		})

		return result
	} catch (error) {
		await publish(
			openaiChannel().status({
				nodeId,
				status: "error",
			}),
		)
		throw error
	}
}
