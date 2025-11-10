import { Hono } from "hono"
import { serve } from "inngest/hono"
import type { AppContext } from "../context"
import { inngest } from "../inngest/client"
import { executeWorkflow } from "../inngest/functions/execute-workflow"

export const inngestRouter = new Hono<AppContext>().all("/", serve({ client: inngest, functions: [executeWorkflow] }))
