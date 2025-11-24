import type { NodeExecutor } from "../../types/executions"
import { googleFormTriggerChannel } from "../channels/google-form-trigger"

type GoogleFormTriggerData = Record<string, unknown>

export const googleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
	context,
	step,
	publish,
	nodeId,
}) => {
	await publish(
		googleFormTriggerChannel().status({
			nodeId,
			status: "loading",
		}),
	)
	const result = await step.run("google-form-trigger", async () => context)
	await publish(
		googleFormTriggerChannel().status({
			nodeId,
			status: "success",
		}),
	)
	return result
}
