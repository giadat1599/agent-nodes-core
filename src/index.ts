import { Hono } from "hono"
import "./env"
import { db } from "./drizzle"

const app = new Hono()

app.get("/", async (c) => {
	const test = await db.execute("SELECT 1")
	return c.text(`Hello! DB Test: ${JSON.stringify(test)}`)
})

export default app
