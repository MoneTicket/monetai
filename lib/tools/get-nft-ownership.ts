import { ethers } from 'ethers'

// Minimal ABI for ERC-721 tokens to get balance
const ERC721_ABI = ['function balanceOf(address owner) view returns (uint256)']

// Determine the RPC URL based on the current environment.
const rpcUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.POLYGON_MAINNET_RPC_URL
    : process.env.POLYGON_AMOY_RPC_URL

// Ensure that the RPC URL is defined before proceeding.
if (!rpcUrl) {
  throw new Error(
    'Polygon RPC URL is not configured. Please set POLYGON_MAINNET_RPC_URL and POLYGON_AMOY_RPC_URL in your environment variables.'
  )
}

// Initialize the provider with the selected RPC URL
const provider = new ethers.JsonRpcProvider(rpcUrl)

/**
 * Fetches the number of NFTs owned by a specific wallet address for a given ERC-721 contract on the Polygon network.
 * @param walletAddress The wallet address (e.g., '0x...') to check.
 * @param nftContractAddress The contract address of the ERC-721 NFT (e.g., '0x...').
 * @returns An object containing the success status, and either the NFT count or an error message.
 */
export async function getNftOwnership(
  walletAddress: string,
  nftContractAddress: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Validate addresses
    if (!ethers.isAddress(walletAddress)) {
      return { success: false, error: 'Invalid wallet address format.' }
    }
    if (!ethers.isAddress(nftContractAddress)) {
      return { success: false, error: 'Invalid NFT contract address format.' }
    }

    // Create a contract instance
    const nftContract = new ethers.Contract(
      nftContractAddress,
      ERC721_ABI,
      provider
    )

    // Fetch the balance (number of NFTs owned)
    const nftCountBigInt = await nftContract.balanceOf(walletAddress)
    const nftCount = Number(nftCountBigInt) // Convert BigInt to number

    return { success: true, count: nftCount }
  } catch (error) {
    console.error('Error fetching NFT ownership:', error)
    return {
      success: false,
      error:
        'An error occurred while fetching NFT ownership. Please check the addresses and network.'
    }
  }
}
