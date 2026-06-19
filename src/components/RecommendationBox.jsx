import React from "react";

/**
 * Parses the raw text recommendations returned by Mistral AI.
 * Converts the custom numbered list format (1., 2., etc.) into structured objects for premium UI rendering.
 * Operates line-by-line to avoid issues with varying divider lengths.
 * 
 * @param {string} text - Raw text from Mistral AI
 * @returns {Array} - Array of recommendation objects
 */
function parseTextRecommendations(text) {
  if (!text || typeof text !== "string") return [];
  
  const lines = text.split("\n");
  const list = [];
  let currentItem = null;
  let parsingSpecs = false;

  lines.forEach((line) => {
    const lineStr = line.trim();
    if (!lineStr) return;

    // Check if the line starts a new recommendation block (e.g. "1. Product Name" or "• Product Name")
    const numberedMatch = lineStr.match(/^(\d+)[\.\:\)\- ]+(.+)$/);
    const bulletMatch = lineStr.startsWith("•") ? lineStr.replace("•", "").trim() : null;

    if (numberedMatch || bulletMatch) {
      // Save the previous item before starting the new one
      if (currentItem) {
        list.push(currentItem);
      }
      
      // Initialize a new recommendation item
      const rawName = numberedMatch ? numberedMatch[2].trim() : bulletMatch;
      currentItem = {
        name: rawName.replace(/\*\*/g, "").trim(), // Strip any bold asterisks
        price: "",
        reason: "",
        specs: []
      };
      parsingSpecs = false; // Reset specs flag for the new item
    } 
    // Parse properties for the active item
    else if (currentItem) {
      if (lineStr.toLowerCase().startsWith("estimated price:")) {
        currentItem.price = lineStr.replace(/estimated price:/i, "").trim();
      } else if (lineStr.toLowerCase().startsWith("reason:")) {
        currentItem.reason = lineStr.replace(/reason:/i, "").trim();
      } else if (lineStr.toLowerCase().startsWith("key specs:")) {
        parsingSpecs = true;
      } else if (parsingSpecs) {
        // Collect specification lines, filtering out dashes and dividers
        if (!lineStr.includes("---") && !lineStr.includes("___")) {
          currentItem.specs.push(lineStr);
        }
      }
    }
  });

  // Push the final item after the loop terminates
  if (currentItem) {
    list.push(currentItem);
  }

  return list;
}

function RecommendationBox({ recommendation, loading, error }) {
  // Parse the recommendation string or fallback to empty array
  const recommendationsList = typeof recommendation === "string" 
    ? parseTextRecommendations(recommendation) 
    : Array.isArray(recommendation) 
      ? recommendation 
      : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-stone-850">AI Recommendations</h2>
      
      <div className="p-6 rounded-2xl bg-stone-55 border border-dashed border-stone-200 min-h-[140px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-stone-550">Mistral is processing your request...</p>
          </div>
        ) : error ? (
          <div className="w-full p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center">
            {error}
          </div>
        ) : recommendation ? (
          <div className="w-full text-left space-y-4">
            {recommendationsList.length === 0 ? (
              // Fallback display if parsing fails
              <div className="w-full text-sm text-stone-700 whitespace-pre-wrap bg-white border border-stone-200 p-5 rounded-xl shadow-sm leading-relaxed">
                {typeof recommendation === "string" ? recommendation.replace(/\*\*/g, "") : ""}
              </div>
            ) : (
              // Premium card layout for parsed recommendations list
              <div className="grid grid-cols-1 gap-4 w-full">
                {recommendationsList.map((rec, index) => {
                  // Filter out empty or divider specification lines
                  const validSpecs = rec.specs.filter(spec => spec.trim() && !spec.includes("---"));
                  
                  return (
                    <div key={index} className="p-6 rounded-xl bg-white border border-stone-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-2.5">
                        <h4 className="font-extrabold text-lg md:text-xl text-amber-900 leading-tight">
                          {index + 1}. {rec.name}
                        </h4>
                        <span className="font-extrabold text-sm md:text-base text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100/50 shrink-0">
                          {rec.price || "N/A"}
                        </span>
                      </div>
                      {rec.reason && (
                        <p className="text-sm text-stone-700 leading-relaxed">
                          <strong className="text-stone-500 font-semibold mr-1">Reason:</strong> {rec.reason}
                        </p>
                      )}
                      {validSpecs.length > 0 && (
                        <div className="pt-2 space-y-1">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Key Specifications</span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-stone-600 bg-stone-50/50 p-3 rounded-lg border border-stone-100">
                            {validSpecs.map((spec, sIndex) => (
                              <li key={sIndex} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                <span>{spec.replace(/^[-•*]/i, "").trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center max-w-sm leading-relaxed">
            Enter your preferences and click "Get Recommendations" to see personalized results.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecommendationBox;
