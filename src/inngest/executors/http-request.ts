import { NonRetriableError } from "inngest"
import { type FetchOptions, ofetch } from "ofetch"
import type { NodeExecutor } from "../../types/executions"

type HttpRequestData = {
	endpoint?: string
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
	body?: string
}

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({ context, step, data }) => {
	if (!data.endpoint) {
		throw new NonRetriableError("No endpoint provided for HTTP request")
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

		return {
			...context,
			httpResponse: {
				status: response.status,
				statusText: response.statusText,
				data: response._data,
			},
		}
	})
	return result
}
