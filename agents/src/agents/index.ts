import type { EventBus } from "../comms/event-bus";
import { ExecutorAgent } from "./executor";
import { StrategistAgent } from "./strategist";
import { WatcherAgent } from "./watcher";

/**
 * Registers all agents and wires up event communication
 * @returns The registered agents
 */
export function registerAgents(eventBus: EventBus) {
	console.log("╔════════════════════════════════════╗");
	console.log("║        LIQUIDMESH AGENTS           ║");
	console.log("╚════════════════════════════════════╝");
	console.log("======== Registering agents =========");

	// Initialize agents
	console.log(`[registerAgents] initializing executor agent...`);
	const executorAgent = new ExecutorAgent("executor", eventBus);
	console.log(`[registerAgents] executor agent initialized.`);

	console.log(`[registerAgents] initializing watcher agent...`);
	const watcherAgent = new WatcherAgent("watcher", eventBus);
	console.log(`[registerAgents] watcher agent initialized.`);

	console.log(`[registerAgents] initializing strategist agent...`);
	const strategistAgent = new StrategistAgent("strategist", eventBus);
	console.log(`[registerAgents] strategist agent initialized.`);

	// Register message flows: Watcher → Strategist → Executor → Strategist → Watcher
	console.log(`[registerAgents] wiring up agent communications...`);

	eventBus.register(`${watcherAgent.name}-${strategistAgent.name}`, (data) =>
		strategistAgent.handleEvent(
			`${watcherAgent.name}-${strategistAgent.name}`,
			data,
		),
	);

	eventBus.register(`${strategistAgent.name}-${executorAgent.name}`, (data) =>
		executorAgent.handleEvent(
			`${strategistAgent.name}-${executorAgent.name}`,
			data,
		),
	);

	eventBus.register(`${executorAgent.name}-${strategistAgent.name}`, (data) =>
		strategistAgent.handleEvent(
			`${executorAgent.name}-${strategistAgent.name}`,
			data,
		),
	);

	eventBus.register(`${strategistAgent.name}-${watcherAgent.name}`, (data) =>
		watcherAgent.handleEvent(
			`${strategistAgent.name}-${watcherAgent.name}`,
			data,
		),
	);

	console.log(`[registerAgents] all agents registered and wired.`);

	return {
		executorAgent,
		watcherAgent,
		strategistAgent,
	};
}

export { ExecutorAgent } from "./executor";
export { StrategistAgent } from "./strategist";
export { WatcherAgent } from "./watcher";
