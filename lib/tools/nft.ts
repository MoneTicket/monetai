import { tool } from 'ai';
import { z } from 'zod';
import { getNftOwnership } from './get-nft-ownership';

export const nftTool = tool({
  description: 'Get the number of NFTs owned by a specific wallet address for a given ERC-721 contract on the Polygon network.',
  name: 'getNftOwnership',
  parameters: z.object({
    walletAddress: z.string().describe("The wallet address (e.g., '0x...') to check the NFT ownership of."),
    nftContractAddress: z.string().describe("The contract address of the ERC-721 NFT (e.g., '0x...')."),
  }),
  execute: async ({ walletAddress, nftContractAddress }) => {
    const result = await getNftOwnership(walletAddress, nftContractAddress);
    if (result.success) {
      return `The wallet ${walletAddress} owns ${result.count} NFTs from the contract ${nftContractAddress}.`;
    }
    return result.error || 'An unknown error occurred.';
  },
});
