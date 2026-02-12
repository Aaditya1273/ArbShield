import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs } from 'ai'
import type { EventBus } from '../../comms/event-bus'
import env from '../../env'
import { saveThought, storeReport } from '../../memory/db'
import {
	getStrategistFinalReportSystemPrompt,
	getStrategistSystemPrompt,
} from '../../system-prompts'
import { Agent } from '../agent'
import { getStrategistToolkit } from './toolkit'

/**
 * Strategist Agent - Analyzes Watcher reports and generates liquidity strategies
 */
export class StrategistAgent extends Agent {
	constructor(name: string, eventBus: EventBus) {
		super(name, eventBus)
	}

	async handleEvent(event: string, data: any): Promise<void> {
		console.log(`[${this.name}] received data from [${event.split('-')[0]}].`)
		switch (event) {
			case `watcher-${this.name}`:
				return this.handleWatcherReport(data)
			case `executor-${this.name}`:
				return this.handleExecutorResult(data)
		}
	}

	private async handleWatcherReport(data: { report: string }): Promise<void> {
		data.report &&
			console.log(
				`[${this.name}] received a report from the watcher agent:\n\n${data.report}.`
			)

		const toolkit = getStrategistToolkit()

		const { toolCalls } = await generateText({
			model: openai(env.MODEL_NAME),
			system: getStrategistSystemPrompt(),
			prompt: `Given the report that follows, decide whether to generate liquidity management strategies for execution.

      Watcher agent report:
      ${data.report}

      Decide whether you want to use the sendMessageToWatcher or sendMessageToExecutor tool. You must use one of them.`,
			tools: toolkit,
			stopWhen: stepCountIs(10),
			onStepFinish: this.onStepFinish.bind(this),
		})

		const tool = toolCalls[0]

		if (!tool || tool.toolName !== 'sendMessageToExecutor') {
			this.eventBus.emit(`${this.name}-watcher`, {
				result: tool ? (tool as any).input.message : 'Generate a new report.',
				report: data.report,
			})
		} else if (tool.toolName === 'sendMessageToExecutor') {
			this.eventBus.emit(`${this.name}-executor`, {
				result: (tool as any).input.message,
				report: data.report,
			})
		}
	}

	async handleExecutorResult(data: { result: string; report: string }): Promise<void> {
		console.log(`[${this.name}] received result from the executor agent:\n\n${data.result}.`)

		const response = await generateText({
			model: openai('gpt-4o'),
			system: getStrategistFinalReportSystemPrompt(),
			prompt: `Given the following report and result, generate a comprehensive report about the execution of the liquidity strategies.

      Watcher agent report:
      ${data.report}

      Executor agent result:
      ${data.result}`,
			stopWhen: stepCountIs(10),
			onStepFinish: this.onStepFinish.bind(this),
		})

		await storeReport(response.text)

		this.eventBus.emit(`${this.name}-watcher`, {
			result: response.text,
			report: data.report,
		})
	}

	async onStepFinish({ text, toolCalls, toolResults }: any) {
		console.log(
			`[strategist] step finished. tools called: ${
				toolCalls.length > 0
					? toolCalls.map((tool: any) => tool.toolName).join(', ')
					: 'none'
			}`
		)
		if (text) {
			await saveThought({
				agent: 'strategist',
				text,
				toolCalls,
				toolResults,
			})
		}
	}
}
