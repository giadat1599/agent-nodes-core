import { zValidator } from "@hono/zod-validator"
import type { ValidationTargets } from "hono"
import type { z } from "zod"

export function validator<T extends z.ZodSchema>(target: keyof ValidationTargets, schema: T) {
	return zValidator(target, schema, (result, c) => {
		if (!result.success) {
			const errorMessages = result.error.issues.map((issue) => issue.message)
			return c.json({ success: false, error: errorMessages }, 400)
		}
	})
}
