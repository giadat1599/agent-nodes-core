import { anthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { inngest } from "../client"

export const execute = inngest.createFunction({ id: "execute-ai" }, { event: "execute/ai" }, async ({ step }) => {
	await step.sleep("sleep", "5s")
	const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text", generateText, {
		model: google("gemini-2.5-flash"),
		system: "You are a helpful assistant that generates text based on user prompts.",
		prompt: "What is 2 plus 2?",
	})

	const { steps: openAiSteps } = await step.ai.wrap("openai-generate-text", generateText, {
		model: openai("gpt-4o"),
		system: "You are a helpful assistant that generates text based on user prompts.",
		prompt: "What is 2 plus 2?",
	})

	const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text", generateText, {
		model: anthropic("claude-3-7-sonnet-20250219"),
		system: "You are a helpful assistant that generates text based on user prompts.",
		prompt: "What is 2 plus 2?",
	})

	return {
		geminiSteps,
		openAiSteps,
		anthropicSteps,
	}
})
