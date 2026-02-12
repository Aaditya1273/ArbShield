import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs } from "ai";
import type { EventBus } from "../../comms/event-bus";
import env from "../../env";
import { saveThought } from "../../memory/db";
import { getExecutorSystemPrompt } from "../../system-prompts";
import { Agent } from "../agent";
import { getExecutorToolkit } from "./toolkit";

/**
 * Executor Agent - Executes liquidity management strategies on Somnia
 */
export class ExecutorAgent extends Agent {
	constructor(name: string, eventBus: EventBus) {
		super(name, eventBus);
	}

	async handleEvent(event: string, data: any): Promise<void> {
		switch (event) {
			case `strategist-${this.name}`:
				return this.handleStrategistStrategy(data);
		}
	}

	private async handleStrategistStrategy(data: {
		result: string;
		report: string;
	}): Promise<void> {
		console.log(
			`[${this.name}] received strategy from strategist:\n\n${data.result}`,
		);

		const toolkit = getExecutorToolkit();

		const response = await generateText({
			model: openai(env.MODEL_NAME),
			system: getExecutorSystemPrompt(),
			prompt: `Execute the following liquidity management strategy:

      ${data.result}

      Use the available tools to simulate and then execute the transactions. Provide detailed feedback about the execution results.`,
			tools: toolkit,
			stopWhen: stepCountIs(20),
			onStepFinish: this.onStepFinish.bind(this),
		});

		this.eventBus.emit(`${this.name}-strategist`, {
			result: response.text,
			report: data.report,
		});
	}

	async onStepFinish({ text, toolCalls, toolResults }: any) {
		console.log(
			`[executor] step finished. tools called: ${
				toolCalls.length > 0
					? toolCalls.map((tool: any) => tool.toolName).join(", ")
					: "none"
			}`,
		);
		if (text) {
			await saveThought({
				agent: "executor",
				text,
				toolCalls,
				toolResults,
			});
		}
	}
}
