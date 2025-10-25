import { Hono } from "hono"
import type { AppContext } from "../context"
import { auth } from "../lib/auth"

export const authRouter = new Hono<AppContext>().on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw))
