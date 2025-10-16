import { defineConfig } from "drizzle-kit"
import env from "./src/env"

export default defineConfig({
	out: "./src/drizzle",
	schema: "./src/drizzle/index.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
