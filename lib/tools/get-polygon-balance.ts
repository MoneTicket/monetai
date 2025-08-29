import { ethers } from 'ethers'

// Determine the RPC URL based on the current environment.
// Use Mainnet for production deployments and Amoy testnet for local development.
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

// Initialize the provider with the selected RPC URL.
const provider = new ethers.JsonRpcProvider(rpcUrl)

/**
 * Fetches the native token (MATIC) balance for a given Polygon wallet address.
 * @param address The Polygon wallet address (e.g., '0x...') to check.
 * @returns An object containing the success status, and either the balance or an error message.
 */
export async function getPolygonBalance(
  address: string,
  selectedAddress?: string
): Promise<{ success: boolean; balance?: string; error?: string }> {
  const addressToUse = address || selectedAddress;

  if (!addressToUse) {
    return { success: false, error: 'No wallet address provided or selected.' };
  }

  try {
    // Validate the address format using ethers.
    if (!ethers.isAddress(addressToUse)) {
      return { success: false, error: 'Invalid wallet address format.' };
    }

    // Fetch the balance from the Polygon blockchain. The result is in Wei.
    const balanceInWei = await provider.getBalance(addressToUse);

    // Format the balance from Wei (the smallest unit) to MATIC (the main unit).
    const balanceInMatic = ethers.formatEther(balanceInWei);

    // Return a success response with the formatted balance.
    return { success: true, balance: balanceInMatic };
  } catch (error) {
    console.error('Error fetching Polygon balance:', error);
    // Return a failure response if any other error occurs.
    return {
      success: false,
      error: 'An error occurred while fetching the balance from the network.'
    };
  }
}
