import { tool } from 'ai'
import { z } from 'zod'

import { getErc20Balance } from './get-erc20-balance'

export const erc20BalanceTool = tool({
  description: 'Get the balance of a specific ERC-20 token for a given wallet address on the Polygon network.',
  parameters: z.object({
    walletAddress: z.string().describe("The wallet address (e.g., '0x...') to check the token balance of."),
    tokenAddress: z.string().describe("The contract address of the ERC-20 token (e.g., '0x...')."),
  }),
  execute: async ({ walletAddress, tokenAddress }) => {
    const result = await getErc20Balance(walletAddress, tokenAddress);
    if (result.success) {
      return `The balance of ${result.symbol} for ${walletAddress} is ${result.balance}.`;
    }
    return result.error || 'An unknown error occurred.';
  },
});
