import type { NodeExecutor } from "../../types/executions"
import { manualTriggerChannel } from "../channels/manual-trigger"

type ManualTriggerData = Record<string, unknown>

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({ context, step, publish, nodeId }) => {
	await publish(
		manualTriggerChannel().status({
			nodeId,
			status: "loading",
		}),
	)
	const result = await step.run("manual-trigger", async () => context)
	await publish(
		manualTriggerChannel().status({
			nodeId,
			status: "success",
		}),
	)
	return result
}
