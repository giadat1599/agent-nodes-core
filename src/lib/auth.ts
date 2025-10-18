import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../drizzle"

import env from "../env"

export const auth = betterAuth({
	appName: "Agent Nodes",
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},
	trustedOrigins: ["http://localhost:5173"],
})

type Auth = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

export type AuthType = {
	user: Auth["user"] | null
	session: Auth["session"] | null
}
