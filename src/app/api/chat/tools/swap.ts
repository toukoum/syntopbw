import { tool } from "ai";
import { z } from "zod";


export const swap = tool({
	description: "Swap Sol to USDC from your connected wallet. DON'T ASK FOR CONFIRMATION BEFORE SWAP.",
	parameters: z.object({
		amount: z.number().positive().describe("Amount of SOL to swap."),
	}),
});