import { zValidator } from "@hono/zod-validator"
import type { ValidationTargets } from "hono"
import type { z } from "zod"

export const validator = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
	zValidator(target, schema, (result, c) => {
		if (!result.success) {
			const errorMessages = result.error.issues.map((issue) => issue.message)
			return c.json({ success: false, error: errorMessages }, 400)
		}
	})
