import axios from "axios";

// Define the API function to fetch product recommendations strictly from the provided catalog using Mistral AI.
export const getRecommendations = async (userPreference, catalog) => {
  // Retrieve the Mistral API key from Vite environment variables (defined in .env).
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || localStorage.getItem("mistral_api_key");

  // Throw an error if the API key is not configured.
  if (!apiKey || apiKey === "your_mistral_api_key_here") {
    throw new Error("Mistral API Key is missing. Please add your VITE_MISTRAL_API_KEY to the .env file.");
  }

  // Construct the API endpoint URL for Mistral Chat Completions.
  const apiUrl = "https://api.mistral.ai/v1/chat/completions";

  // Build the system instructions and formatting rules for Mistral AI.
  const prompt = `You are an expert AI Product Recommendation Assistant.

Your goal is to help users find the best products from the provided catalog based on their preferences.

User Request:
"${userPreference}"

Explicitly Provided Product Catalog:
${JSON.stringify(catalog, null, 2)}

Instructions:

1. Carefully analyze the user's requirements (e.g. budget in dollars, brand, purpose).

2. **STRICT CATALOG POLICY**: You MUST recommend products EXCLUSIVELY from the provided Product Catalog above. Do not recommend or invent any products that are not in the provided catalog list.

3. Recommend up to 5 matching products from the catalog.

4. If the user specifies a budget (e.g. under $500), recommend ONLY products whose price is within that budget constraint (e.g. price <= 500).

5. If the user specifies a brand, prioritize products from that brand.

6. For every recommendation, you MUST provide:
- Product Name (exactly matching the name in the catalog, prefixed with the recommendation number)
- Estimated Price (exact price from the catalog, e.g. $549 or $399)
- Why it is recommended (concise 1-2 line explanation pointing to their preference like price, RAM, or processor)
- Key specifications (RAM, Storage, Processor/Chipset, Category) exactly as listed in the catalog.

7. Keep explanations and spec descriptions concise. Do not leave the specifications section empty.

8. Return the response in a clean numbered list format (1., 2., 3., 4., 5.). Do not use markdown bold formatting, double asterisks (**), or any other formatting characters anywhere in the response.

9. If no matching products exist within the budget/preferences, suggest the closest alternatives from the catalog (e.g. slightly higher price, or a different brand) and state clearly in the reason that it exceeds the preference but is the closest match. Never recommend a product from outside the catalog.

10. Keep the response concise, professional and user-friendly.

Output format:

1. Product Name
Estimated Price: $[value]
Reason: Short explanation of why it fits the preferences.
Key Specs:
  - RAM: [value]
  - Storage: [value]
  - Processor: [value]
  - Brand/Category: [value]
-----------------------------------
2. Product Name
... (continue up to matching products) ...`;

  try {
    // Perform the POST request to the Mistral AI API using Axios.
    const response = await axios.post(
      apiUrl,
      {
        model: "mistral-small-latest", // Use Mistral's robust Small model.
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`, // Supply the bearer auth header.
          "Content-Type": "application/json"
        }
      }
    );

    // Extract the raw text response from the Mistral structure.
    const responseText = response.data.choices[0].message.content;

    // Return the raw text recommendations directly.
    return responseText;
  } catch (error) {
    // Catch, log, and rethrow any network, parsing, or server error.
    console.error("Mistral API Error:", error);

    // Detect if this error is a rate limit error (HTTP 429).
    if (error.response?.status === 429) {
      throw new Error("Mistral API Rate Limit Exceeded. Please wait a moment before trying again.");
    }

    throw new Error(error.response?.data?.message || error.message || "Failed to fetch recommendations.");
  }
};
