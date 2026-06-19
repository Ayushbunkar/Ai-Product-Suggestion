import { useState } from "react";
import InputForm from "./components/InputForm";
import ProductList from "./components/ProductList";
import RecommendationBox from "./components/RecommendationBox";
import products from "./data/products";
import { getRecommendations } from "./services/aiService";

function App() {
  const [query, setQuery] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecommendation = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const result = await getRecommendations(query, products);
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Extract recommended IDs from the text output to highlight items in the catalog
  const recommendedIds = [];
  if (typeof recommendation === "string") {
    products.forEach((product) => {
      // Check if the product name appears in the recommendation text (case insensitive)
      const regex = new RegExp(product.name, "i");
      if (regex.test(recommendation)) {
        recommendedIds.push(product.id);
      }
    });
  } else if (Array.isArray(recommendation)) {
    recommendation.forEach((item) => recommendedIds.push(item.id));
  }

  return (
    <div className="bg-[#FAF7F2] text-stone-800 min-h-screen flex flex-col items-center justify-start p-6 md:p-12 font-sans selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-800 via-stone-700 to-amber-900 bg-clip-text text-transparent tracking-tight">
            AI Product Recommender
          </h1>
          <p className="text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Enter your preferences below to match and find products strictly from our catalog of 10 items.
          </p>
        </header>

        {/* Input Form Section */}
        <section className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm shadow-stone-100">
          <InputForm
            query={query}
            setQuery={setQuery}
            onSubmit={handleRecommendation}
          />
        </section>

        {/* Product List Section */}
        <section className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm shadow-stone-100">
          <ProductList products={products} recommendedIds={recommendedIds} />
        </section>

        {/* Recommendation Box Section */}
        <section className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-sm shadow-stone-100">
          <RecommendationBox
            recommendation={recommendation}
            loading={loading}
            error={error}
          />
        </section>

      </div>
    </div>
  );
}

export default App;
