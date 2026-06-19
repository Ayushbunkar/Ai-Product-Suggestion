import axios from "axios";

// Define the API function to fetch product recommendations from the broader market using Mistral AI.
export const getRecommendations = async (userPreference) => {
  // 1. Retrieve the API key from Vite env variables or localStorage
  let apiKey = import.meta.env.VITE_MISTRAL_API_KEY || localStorage.getItem("mistral_api_key");

  // 2. If missing (often due to Vite terminal working directory mismatch on localhost), 
  //    silently prompt the user to input the key in browser. This will only run on localhost.
  if (!apiKey || apiKey === "your_mistral_api_key_here") {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      const userKey = window.prompt(
        "Mistral API Key not found in .env file. Please paste your Mistral API Key here to test on localhost (it will be saved locally):"
      );
      if (userKey && userKey.trim()) {
        apiKey = userKey.trim();
        localStorage.setItem("mistral_api_key", apiKey);
      }
    }
  }

  // 3. Throw an error if the API key is still missing.
  if (!apiKey || apiKey === "your_mistral_api_key_here") {
    throw new Error(
      "Mistral API Key is missing. Please set the VITE_MISTRAL_API_KEY environment variable on your server/Vercel, or set up a local .env file."
    );
  }

  // Construct the API endpoint URL for Mistral Chat Completions.
  const apiUrl = "https://api.mistral.ai/v1/chat/completions";

  // Build the system instructions and formatting rules for Mistral AI.
  const prompt = `You are an expert AI Product Recommendation Assistant.

Your goal is to help users find the best products in the market based on their preferences.

User Request:
"${userPreference}"

Instructions:

1. Carefully analyze the user's requirements.

2. Recommend exactly 5 actual products available in the market. Do not recommend fewer than 5 products.

3. If the user specifies a budget, stay within that budget.

4. If the user specifies a brand, prioritize that brand.

5. If the user specifies a purpose (gaming, camera, office work, fitness, battery life, coding, travelling, etc.), prioritize products suitable for that purpose.

6. If the user gives very little information, make reasonable assumptions and still provide recommendations.

7. For every recommendation, you MUST provide:
- Product Name (prefixed with the recommendation number)
- Estimated Price
- Why it is recommended (concise 1-2 line explanation)
- Key specifications (such as RAM, Storage, Processor/Chipset, Battery, Screen size) listed in a clear indented bullet-point list.

8. Keep explanations and spec descriptions concise. Do not leave the specifications section empty.

9. Return the response in a clean numbered list format of exactly 5 products (1., 2., 3., 4., 5.). Do not use markdown bold formatting, double asterisks (**), or any other formatting characters anywhere in the response.

10. Never reply with "No matching products found" unless the request is impossible.

11. If no exact match exists, suggest the closest alternatives to fulfill the 5 recommendations limit.

12. Keep the response concise, professional and user-friendly.

Output format:

1. Product Name
Estimated Price: ₹xxxxx
Reason: Short explanation of why it fits the preferences.
Key Specs:
  - RAM: [value]
  - Storage: [value]
  - Processor: [value]
  - Battery/Display: [value]
-----------------------------------
2. Product Name
... (continue up to 5) ...`;

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
