import { Hono } from "hono"
import { serve } from "inngest/hono"
import type { AppContext } from "../context"
import { inngest } from "../inngest/client"
import { functions } from "../inngest/functions"

export const inngestRouter = new Hono<AppContext>().all("/", serve({ client: inngest, functions }))
