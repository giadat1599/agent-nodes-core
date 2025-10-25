import type { Context } from "hono"
import type { AppContext } from "../context"
import type { SuccessResponse } from "../types/response"

export function toSuccessResponse<T>(data: T, c: Context<AppContext>) {
	return c.json<SuccessResponse<T>>({
		success: true,
		data,
	})
}
