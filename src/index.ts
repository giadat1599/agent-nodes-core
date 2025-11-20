import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import "./env"

import { cors } from "hono/cors"
import type { AppContext } from "./context"
import env from "./env"

import { auth } from "./lib/auth"
import { authRouter } from "./routes/auth"
import { inngestRouter } from "./routes/inngest"
import { nodeRouter } from "./routes/node"
import { webhookRouter } from "./routes/webhook"
import { workflowRouter } from "./routes/workflow"
import type { ErrorResponse } from "./types/response"

const app = new Hono<AppContext>()

app.use(
	"*",
	cors({
		origin: "http://localhost:5173",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PATCH"],
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
	.route("/nodes", nodeRouter)
	.route("/webhooks", webhookRouter)

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		const errResponse =
			err.res ??
			c.json<ErrorResponse>(
				{
					success: false,
					errors: [err.message],
				},
				err.status,
			)
		return errResponse
	}

	return c.json<ErrorResponse>(
		{
			success: false,
			errors: [env.NODE_ENV === "production" ? "Interal Server Error" : (err.stack ?? err.message)],
		},
		500,
	)
})

export default app
