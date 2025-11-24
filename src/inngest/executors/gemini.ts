import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NonRetriableError } from "inngest"
import type { NodeExecutor } from "../../types/executions"
import { geminiChannel } from "../channels/gemini"

import Handlebars = require("handlebars")

const AVAILABLE_MODELS = [
	"gemini-1.5-flash",
	"gemini-1.5-flash-8b",
	"gemini-1.5-pro",
	"gemini-1.0-pro",
	"gemini-pro",
] as const

type GeminiData = {
	variableName: string
	model: (typeof AVAILABLE_MODELS)[number]
	systemPrompt: string
	userPrompt: string
}

export const geminiExecutor: NodeExecutor<GeminiData> = async ({ context, step, publish, nodeId, data }) => {
	await publish(
		geminiChannel().status({
			nodeId,
			status: "loading",
		}),
	)
	try {
		if (!data.model) {
			throw new NonRetriableError("No model provided for Gemini executor")
		}

		if (!data.variableName) {
			throw new NonRetriableError("No variableName provided for Gemini executor")
		}

		if (!data.userPrompt) {
			throw new NonRetriableError("No userPrompt provided for Gemini executor")
		}

		const result = await step.run("gemini", async () => {
			const resolved = Handlebars.compile(data.userPrompt || "{}")(context)
			const { steps } = await generateText({
				model: google(data.model || "gemini-2.0-flash"),
				system: data.systemPrompt || undefined,
				prompt: resolved,
			})
			await publish(
				geminiChannel().status({
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
			geminiChannel().status({
				nodeId,
				status: "error",
			}),
		)
		throw error
	}
}
