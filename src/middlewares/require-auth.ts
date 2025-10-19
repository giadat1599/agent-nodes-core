import { createMiddleware } from "hono/factory"
import type { Context } from "../context"

export const requireAuth = createMiddleware<Context>(async (c, next) => {
	const user = c.get("user")

	if (!user) return c.body("Unauthorized", 401)

	await next()
})
