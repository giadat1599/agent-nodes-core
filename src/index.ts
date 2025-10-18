import { Hono } from "hono"
import "./env"

import { cors } from "hono/cors"
import { type AuthType, auth } from "./lib/auth"

const app = new Hono<{ Variables: AuthType }>()

app.use(
	"/api/auth/*",
	cors({
		origin: "http://localhost:5173",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
)

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers })
	if (!session) {
		c.set("user", null)
		c.set("session", null)
		return next()
	}
	c.set("user", session.user)
	c.set("session", session.session)
	return next()
})

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw)
})

app.get("/session", (c) => {
	const session = c.get("session")
	const user = c.get("user")

	if (!user) return c.body(null, 401)
	return c.json({
		session,
		user,
	})
})

export default app
