import { Hono } from "hono";
import type { Environment } from "../env";
import { retrieveThoughts, retrieveThoughtsByAgent } from "../memory";

const thoughtsRouter = new Hono<Environment>();

thoughtsRouter.get("/", async (c) => {
	const { data, error } = await retrieveThoughts();

	if (error) {
		return c.json({ error: error.message }, 500);
	}

	return c.json({ thoughts: data });
});

thoughtsRouter.get("/:agent", async (c) => {
	const agent = c.req.param("agent");
	const { data, error } = await retrieveThoughtsByAgent(agent);

	if (error) {
		return c.json({ error: error.message }, 500);
	}

	return c.json({ agent, thoughts: data });
});

export { thoughtsRouter };
