import { tool } from 'ai'
import { z } from 'zod'

import { getPolygonBalance } from './get-polygon-balance'

export const polygonTool = tool({
  description:
    'Get the native token (MATIC) balance for a given wallet address on the Polygon network.',
  parameters: z.object({
    address: z
      .string()
      .describe(
        "The wallet address or ENS name (e.g., '0x...' or 'vitalik.eth') to check the balance of."
      )
  }),
  execute: async ({ address }) => {
    const result = await getPolygonBalance(address)
    if (result.success) {
      return `The MATIC balance for ${address} is ${result.balance} MATIC.`
    }
    // If there was an error, return the error message to the model.
    return result.error || 'An unknown error occurred.'
  }
})
