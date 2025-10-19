import type { Env } from "hono"
import type { auth } from "./lib/auth"

type Auth = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export interface Context extends Env {
	Variables: {
		user: Auth["user"] | null
		session: Auth["session"] | null
	}
}
