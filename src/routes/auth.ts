import { Hono } from "hono"
import type { Context } from "../context"
import { auth } from "../lib/auth"

export const authRouter = new Hono<Context>().on(["POST", "GET"], "/*", (c) => auth.handler(c.req.raw))
