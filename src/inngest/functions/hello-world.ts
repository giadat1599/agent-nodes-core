import { db } from "../../drizzle"
import { workflow } from "../../drizzle/schemas"
import { inngest } from "../client"

export const helloWorld = inngest.createFunction(
	{ id: "hello-world" },
	{ event: "test/hello.world" },
	async ({ step }) => {
		await step.sleep("wait-a-moment", "10s")

		await step.sleep("wait-a-moment", "10s")

		await step.sleep("wait-a-moment", "10s")

		await step.run("create-workflow", async () => {
			await db.insert(workflow).values({
				name: "New Workflow From Inngest",
			})
		})
	},
)
