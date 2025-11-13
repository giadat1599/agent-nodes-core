import { NonRetriableError } from "inngest"
import { type FetchOptions, ofetch } from "ofetch"
import type { NodeExecutor } from "../../types/executions"

import Handlebars = require("handlebars")

Handlebars.registerHelper("json", (context) => JSON.stringify(context, null, 2))

type HttpRequestData = {
	variableName: string
	endpoint: string
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
	body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ context, step, data }) => {
	if (!data.endpoint) {
		throw new NonRetriableError("No endpoint provided for HTTP request")
	}
	if (!data.variableName) {
		throw new NonRetriableError("No variableName provided for HTTP request")
	}

	if (!data.method) {
		throw new NonRetriableError("No method provided for HTTP request")
	}

	const result = await step.run("http-request", async () => {
		const endpoint = Handlebars.compile(data.endpoint)(context)
		const method = data.method
		const options: FetchOptions = { method }

		if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
			const resolved = Handlebars.compile(data.body || "{}")(context)
			JSON.parse(resolved)
			options.body = resolved
		}
		const response = await ofetch.raw(endpoint, options)

		const responsePayload = {
			httpResponse: {
				status: response.status,
				statusText: response.statusText,
				data: response._data,
			},
		}

		return {
			...context,
			[data.variableName]: responsePayload,
		}
	})
	return result
}
