import { ethers } from 'ethers'

// Minimal ABI for ERC-721 tokens to get balance and ownerOf
const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)'
]

// Determine the RPC URL based on the current environment.
const rpcUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.POLYGON_MAINNET_RPC_URL
    : process.env.POLYGON_AMOY_RPC_URL

if (!rpcUrl) {
  throw new Error(
    'Polygon RPC URL is not configured. Please set POLYGON_MAINNET_RPC_URL and POLYGON_AMOY_RPC_URL in your environment variables.'
  )
}

const provider = new ethers.JsonRpcProvider(rpcUrl)

/**
 * Fetches the number of NFTs owned by a specific wallet address for a given ERC-721 contract on the Polygon network.
 * @param contractAddress The contract address of the ERC-721 token.
 * @param walletAddress The wallet address to check.
 * @param selectedAddress The address selected by the user in the UI context.
 * @param selectedAsset The asset selected by the user in the UI context.
 * @returns An object containing the success status, and either the balance or an error message.
 */
export async function getNftOwnership(
  contractAddress: string,
  walletAddress: string,
  selectedAddress?: string,
  selectedAsset?: any
): Promise<{ success: boolean; count?: number; error?: string }> {
  const addressToUse = walletAddress || selectedAddress;
  const contractToUse = contractAddress || selectedAsset?.contract_address;

  if (!addressToUse) {
    return { success: false, error: 'No wallet address provided or selected.' };
  }
  if (!contractToUse) {
    return { success: false, error: 'No NFT contract address provided or selected.' };
  }

  try {
    if (!ethers.isAddress(addressToUse)) {
      return { success: false, error: 'Invalid wallet address format.' };
    }
    if (!ethers.isAddress(contractToUse)) {
      return { success: false, error: 'Invalid NFT contract address format.' };
    }

    const nftContract = new ethers.Contract(contractToUse, ERC721_ABI, provider);

    // Fetch the balance (number of NFTs owned)
    const nftCountBigInt = await nftContract.balanceOf(addressToUse);
    const nftCount = Number(nftCountBigInt); // Convert BigInt to number

    return { success: true, count: nftCount };
  } catch (error) {
    console.error('Error fetching NFT ownership:', error);
    return {
      success: false,
      error: 'An error occurred while fetching NFT ownership. Please check the addresses and network.'
    };
  }
}
