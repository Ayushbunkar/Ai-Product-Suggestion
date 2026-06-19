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
    const numberedMatch = lineStr.match(/^(\d+)[\.\: ]+(.+)$/);
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
                    <div key={index} className="p-6 rounded-xl bg-white border border-stone-200 shadow-sm space-y-4">
                      {/* Product Header */}
                      <div className="flex justify-between items-start gap-4 border-b border-stone-100 pb-2.5">
                        <h4 className="font-extrabold text-lg md:text-xl text-amber-900 leading-tight">
                          {index + 1}. {rec.name}
                        </h4>
                        <span className="font-extrabold text-sm md:text-base text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100/50 shrink-0">
                          {rec.price || "N/A"}
                        </span>
                      </div>
                      
                      {/* Reason Description */}
                      {rec.reason && (
                        <p className="text-sm text-stone-700 leading-relaxed">
                          <strong className="text-stone-500 font-semibold mr-1">Reason:</strong> {rec.reason}
                        </p>
                      )}
                      
                      {/* Specifications List */}
                      {validSpecs.length > 0 && (
                        <div className="pt-1 space-y-1">
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

                      {/* Store Links with Logos */}
                      <div className="pt-3 border-t border-stone-100/80 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">Shop:</span>
                        
                        {/* Amazon India Link */}
                        <a 
                          href={`https://www.amazon.in/s?k=${encodeURIComponent(rec.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
                        >
                          {/* Amazon Shopping Cart SVG Icon */}
                          <svg className="w-4 h-4 fill-amber-600" viewBox="0 0 24 24">
                            <path d="M17.21 9l-4.38-4.38a.996.996 0 1 0-1.41 1.41L15.04 9.6c.38.38.38 1.02 0 1.41l-3.62 3.62a.996.996 0 1 0 1.41 1.41L17.21 11c.54-.54.54-1.42 0-2zm-6.61.6a.996.996 0 1 0-1.41-1.41L4.79 12.6c-.54.54-.54 1.42 0 1.95l4.38 4.38a.996.996 0 1 0 1.41-1.41L6.96 14.4c-.38-.38-.38-1.02 0-1.41l3.64-3.39z"/>
                          </svg>
                          Amazon
                        </a>

                        {/* Flipkart Link */}
                        <a 
                          href={`https://www.flipkart.com/search?q=${encodeURIComponent(rec.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
                        >
                          {/* Flipkart Bag SVG Icon */}
                          <svg className="w-4 h-4 fill-blue-600" viewBox="0 0 24 24">
                            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
                          </svg>
                          Flipkart
                        </a>

                        {/* Brand Official Website (via Google search) */}
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(rec.name + ' official store')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
                        >
                          {/* Globe/Official Website SVG Icon */}
                          <svg className="w-4 h-4 text-stone-500 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            <path d="M2 12h20"/>
                          </svg>
                          Official Site
                        </a>
                      </div>

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
