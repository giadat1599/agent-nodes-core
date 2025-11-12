import { NonRetriableError } from "inngest"
import { type FetchOptions, ofetch } from "ofetch"
import type { NodeExecutor } from "../../types/executions"

type HttpRequestData = {
	variableName?: string
	endpoint?: string
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
	body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ context, step, data }) => {
	if (!data.endpoint) {
		throw new NonRetriableError("No endpoint provided for HTTP request")
	}
	if (!data.variableName) {
		throw new NonRetriableError("No variableName provided for HTTP request")
	}

	const result = await step.run("http-request", async () => {
		const method = data.method || "GET"
		// biome-ignore lint/style/noNonNullAssertion: <handled by !data.endpoint check above>
		const endpoint = data.endpoint!
		const options: FetchOptions = { method }

		if (["POST", "PUT", "PATCH"].includes(method) && data.body) {
			options.body = data.body
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
			[data.variableName!]: responsePayload,
		}
	})
	return result
}
