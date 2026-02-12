import { tool } from "ai";
import { z } from "zod";

export function getStrategistToolkit() {
	return {
		sendMessageToWatcher: tool({
			description:
				"Use this tool to request additional data or clarification from the Watcher agent.",
			inputSchema: z.object({
				message: z
					.string()
					.describe("The message or question to send to the Watcher"),
			}),
		}),
		sendMessageToExecutor: tool({
			description:
				"Use this tool to send liquidity management strategies to the Executor agent for execution.",
			inputSchema: z.object({
				message: z
					.string()
					.describe(
						"The strategy instructions in detail, including pool addresses, ranges, and expected outcomes",
					),
			}),
		}),
	};
}
