import { tool } from "ai";
import { z } from "zod";

export const checkPortfolio = tool({
  description:
    "Query the balance of your connected wallet. Don't ask for confirmation before checking.",
  parameters: z.object({}),
});
