import { createMiddleware } from "hono/factory"
import type { AppContext } from "../context"

export const requireAuth = createMiddleware<AppContext>(async (c, next) => {
	const user = c.get("user")

	if (!user) return c.body("Unauthorized", 401)

	await next()
})
