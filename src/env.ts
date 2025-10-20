import { type ZodError, z } from "zod"

const envSchema = z.object({
	DATABASE_URL: z.url(),
	BETTER_AUTH_URL: z.url(),
	BETTER_AUTH_SECRET: z.string(),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	// TODO: testing, will remove later
	GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
	ANTHROPIC_API_KEY: z.string(),
	OPENAI_API_KEY: z.string(),
})

type Env = z.infer<typeof envSchema>

let env: Env

try {
	env = envSchema.parse(process.env)
} catch (err) {
	const error = err as ZodError
	console.error("Invalid env: ")
	console.error(z.flattenError(error).fieldErrors)
	process.exit(1)
}

export default env
