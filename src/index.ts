import { Hono } from "hono"
import "./env"

import { cors } from "hono/cors"
import type { Context } from "./context"
import { inngest } from "./inngest/client"
import { auth } from "./lib/auth"
import { authRouter } from "./routes/auth"
import { inngestRouter } from "./routes/inngest"
import { workflowRouter } from "./routes/workflow"

const app = new Hono<Context>()

app.use(
	"*",
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

app
	.basePath("/api")
	.route("/auth", authRouter)
	.route("/inngest", inngestRouter)
	.route("/workflows", workflowRouter)
	.post("/test-ai", async (c) => {
		await inngest.send({
			name: "execute/ai",
		})

		return c.json({ success: true, message: "AI execution started" })
	})

export default app
