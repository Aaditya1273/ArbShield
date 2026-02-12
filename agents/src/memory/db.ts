import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import env from "../env";

// Create a single supabase client for interacting with your database
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

/**
 * Saves a thought to the database
 * @param agent - The agent that made the thought
 * @param text - The text of the thought
 * @param toolCalls - The tool calls made by the agent
 * @param toolResults - The tool results returned by the agent
 */
export const saveThought = async ({
	agent,
	text,
	toolCalls,
	toolResults,
}: {
	agent: string;
	text: string;
	toolCalls: any;
	toolResults: any;
}) =>
	supabase.from("thoughts").insert({
		agent,
		text,
		tool_calls: toolCalls,
		tool_results: toolResults,
	});

/**
 * Retrieves all thoughts from the database
 * @returns All thoughts
 */
export const retrieveThoughts = async () =>
	supabase
		.from("thoughts")
		.select("*")
		.order("created_at", { ascending: false });

/**
 * Retrieves all thoughts from the database for a given agent
 * @param agent - The agent to retrieve thoughts for
 * @returns All thoughts for the given agent
 */
export const retrieveThoughtsByAgent = async (agent: string) =>
	supabase
		.from("thoughts")
		.select("*")
		.eq("agent", agent)
		.order("created_at", { ascending: false });

/**
 * Stores a strategy/report in the database
 * @param report - The report to store
 */
export const storeReport = async (report: string) => {
	const openai = new OpenAI();
	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input: report.replace(/\n/g, " "),
	});

	const embedding = embeddingResponse.data[0].embedding;

	const { error } = await supabase
		.from("documents")
		.insert({ content: report, embedding });

	if (error) {
		console.error(`[storeReport] error: ${JSON.stringify(error)}`);
	}
};

/**
 * Retrieves past reports from the database
 * @param question - The question to retrieve past reports for
 * @returns Past reports
 */
export const retrievePastReports = async (question: string) => {
	const openai = new OpenAI();
	const embeddingResponse = await openai.embeddings.create({
		model: "text-embedding-ada-002",
		input: question.replace(/\n/g, " "),
	});

	const questionEmbedding = embeddingResponse.data[0].embedding;

	const { data: documents } = await supabase.rpc("match_documents", {
		query_embedding: questionEmbedding,
		match_threshold: 0.78,
		match_count: 10,
	});

	return documents;
};
