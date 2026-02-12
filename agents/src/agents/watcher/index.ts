import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs } from 'ai'
import type { EventBus } from '../../comms/event-bus'
import env from '../../env'
import { saveThought } from '../../memory/db'
import { getWatcherSystemPrompt } from '../../system-prompts'
import { Agent } from '../agent'
import { getWatcherToolkit } from './toolkit'

const WATCHER_STARTING_PROMPT =
	'Analyze current liquidity pool conditions on Somnia and generate a market intelligence report explaining potential optimization opportunities.'

/**
 * Watcher Agent - Monitors pool metrics and generates market intelligence reports
 */
export class WatcherAgent extends Agent {
	address?: string

	constructor(name: string, eventBus: EventBus) {
		super(name, eventBus)
	}

	async handleEvent(event: string, data: any): Promise<void> {
		switch (event) {
			case `strategist-${this.name}`:
				return this.handleStrategistEvent(data)
		}
	}

	private async handleStrategistEvent(data: any): Promise<void> {
		if (data) {
			console.log(`[${this.name}] received feedback from strategist: ${data.result}`)
		}

		await this.start(this.address!, data)
	}

	async start(address: string, strategistData?: any): Promise<any> {
		this.address = address

		const toolkit = getWatcherToolkit(address)

		if (!strategistData) {
			const response = await generateText({
				model: openai(env.MODEL_NAME),
				system: getWatcherSystemPrompt(address),
				prompt: WATCHER_STARTING_PROMPT,
				tools: toolkit,
				stopWhen: stepCountIs(100),
				onStepFinish: this.onStepFinish.bind(this),
			})

			this.eventBus.emit(`${this.name}-strategist`, {
				report: response.text,
			})
		} else {
			const response = await generateText({
				model: openai(env.MODEL_NAME),
				system: getWatcherSystemPrompt(address),
				messages: [
					{
						role: 'assistant',
						content: strategistData.report,
					},
					{
						role: 'user',
						content: `This is the feedback from the executor agent:\n${strategistData.result}`,
					},
				],
				tools: toolkit,
				stopWhen: stepCountIs(100),
				onStepFinish: this.onStepFinish.bind(this),
			})

			this.eventBus.emit(`${this.name}-strategist`, {
				report: response.text,
			})
		}
	}

	async onStepFinish({ text, toolCalls, toolResults }: any) {
		console.log(
			`[watcher] step finished. tools called: ${
				toolCalls.length > 0
					? toolCalls.map((tool: any) => tool.toolName).join(', ')
					: 'none'
			}`
		)
		if (text) {
			await saveThought({
				agent: 'watcher',
				text,
				toolCalls,
				toolResults,
			})
		}
	}
}
