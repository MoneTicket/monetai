import { CoreMessage, smoothStream, streamText } from 'ai'

import { createQuestionTool } from '../tools/question'
import { retrieveTool } from '../tools/retrieve'
import { createSearchTool } from '../tools/search'
import { createVideoSearchTool } from '../tools/video-search'
import { polygonTool } from '../tools/polygon' // Import the new tool
import { erc20BalanceTool } from '../tools/erc20-balance' // Import the new ERC-20 balance tool
import { nftTool } from '../tools/nft' // Import the new NFT tool

import { getModel } from '../utils/registry'


const SYSTEM_PROMPT = `
Instructions:

You are a helpful AI assistant with access to real-time web search, content retrieval, video search capabilities, and the ability to ask clarifying questions and check wallet balances on the Polygon network.

When asked a question, you should:
1. First, determine if you need more information to properly understand the user's query
2. **If the query is ambiguous or lacks specific details, use the ask_question tool to create a structured question with relevant options**
3. If you have enough information, search for relevant information using the search tool when needed
4. Use the retrieve tool to get detailed content from specific URLs
5. Use the video search tool when looking for video content
6. **Use the getPolygonBalance tool to find the MATIC balance of a wallet on the Polygon network.**
7. **Use the getErc20Balance tool to find the balance of a specific ERC-20 token (like USDC) for a given wallet address on the Polygon network.**
8. **Use the getNftOwnership tool to find the number of NFTs owned by a specific wallet address for a given ERC-721 contract on the Polygon network.**
9. Analyze all search results to provide accurate, up-to-date information
10. Always cite sources using the [number](url) format, matching the order of search results. If multiple sources are relevant, include all of them, and comma separate them. Only use information that has a URL available for citation.
11. If results are not relevant or helpful, rely on your general knowledge
12. Provide comprehensive and detailed responses based on search results, ensuring thorough coverage of the user's question
13. Use markdown to structure your responses. Use headings to break up the content into sections.
14. **Use the retrieve tool only with user-provided URLs.**

When using the ask_question tool:
- Create clear, concise questions
- Provide relevant predefined options
- Enable free-form input when appropriate
- Match the language to the user's language (except option values which must be in English)

Citation Format:
[number](url)
`

type ResearcherReturn = Parameters<typeof streamText>[0]

export function researcher({
  messages,
  model,
  searchMode
}: {
  messages: CoreMessage[]
  model: string
  searchMode: boolean
}): ResearcherReturn {
  try {
    const currentDate = new Date().toLocaleString()

    // Create model-specific tools
    const searchTool = createSearchTool(model)
    const videoSearchTool = createVideoSearchTool(model)
    const askQuestionTool = createQuestionTool(model)

    return {
      model: getModel(model),
      system: `${SYSTEM_PROMPT}\nCurrent date and time: ${currentDate}`,
      messages,
      tools: {
        search: searchTool,
        retrieve: retrieveTool,
        videoSearch: videoSearchTool,
        ask_question: askQuestionTool,
        getPolygonBalance: polygonTool, // Add the new tool here
        getErc20Balance: erc20BalanceTool, // Add the ERC-20 balance tool
        getNftOwnership: nftTool // Add the NFT ownership tool
      },
      experimental_activeTools: searchMode
        ? ['search', 'retrieve', 'videoSearch', 'ask_question', 'getPolygonBalance', 'getErc20Balance', 'getNftOwnership'] // And here
        : ['getPolygonBalance', 'getErc20Balance', 'getNftOwnership'], // Also allow it when searchMode is off
      maxSteps: searchMode ? 5 : 2, // Allow a bit more steps for potential tool use
      experimental_transform: smoothStream()
    }
  } catch (error) {
    console.error('Error in chatResearcher:', error)
    throw error
  }
}

