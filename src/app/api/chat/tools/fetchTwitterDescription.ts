import { tool } from "ai";
import { z } from "zod";

export const send = tool({
	description: "Fetch Twitter username to collect last 100 tweets. DON'T ASK FOR CONFIRMATION.",
	parameters: z.object({
		username: z.string().describe("Twitter username."),
	}),
});