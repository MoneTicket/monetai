import { ethers } from 'ethers'

// Minimal ABI for ERC-20 tokens to get balance and decimals
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

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
 * Fetches the balance of a specific ERC-20 token for a given wallet address on the Polygon network.
 * @param tokenAddress The contract address of the ERC-20 token.
 * @param walletAddress The wallet address to check.
 * @param selectedAddress The address selected by the user in the UI context.
 * @param selectedAsset The asset selected by the user in the UI context.
 * @returns An object containing the success status, and either the balance, symbol, or an error message.
 */
export async function getErc20Balance(
  tokenAddress: string,
  walletAddress: string,
  selectedAddress?: string,
  selectedAsset?: any
): Promise<{
  success: boolean
  balance?: string
  symbol?: string
  error?: string
}> {
  const addressToUse = walletAddress || selectedAddress;
  const tokenToUse = tokenAddress || selectedAsset?.contract_address;

  if (!addressToUse) {
    return { success: false, error: 'No wallet address provided or selected.' };
  }
  if (!tokenToUse) {
    return { success: false, error: 'No token contract address provided or selected.' };
  }

  try {
    // Validate addresses
    if (!ethers.isAddress(addressToUse)) {
      return { success: false, error: 'Invalid wallet address format.' };
    }
    if (!ethers.isAddress(tokenToUse)) {
      return { success: false, error: 'Invalid token contract address format.' };
    }

    // Create a contract instance
    const tokenContract = new ethers.Contract(tokenToUse, ERC20_ABI, provider);

    // Fetch balance and decimals
    const balanceInWei = await tokenContract.balanceOf(addressToUse);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    // Format the balance
    const formattedBalance = ethers.formatUnits(balanceInWei, decimals);

    return { success: true, balance: formattedBalance, symbol: symbol };
  } catch (error) {
    console.error('Error fetching ERC-20 balance:', error);
    return {
      success: false,
      error:
        'An error occurred while fetching the ERC-20 balance. Please check the addresses and network.'
    };
  }
}
