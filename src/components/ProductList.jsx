import React from "react";

function ProductList({ products, recommendedIds = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-stone-800">Available Products Catalog</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {products.map((product) => {
          const isMatched = recommendedIds.includes(product.id);
          return (
            <div
              key={product.id}
              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isMatched
                  ? "bg-amber-50/50 border-amber-500 shadow-[0_4px_15px_rgba(217,119,6,0.1)] -translate-y-1"
                  : "bg-stone-50 border-stone-200/80 hover:border-amber-300 hover:-translate-y-0.5"
              }`}
            >
              {isMatched && (
                <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-600 text-white uppercase tracking-wide shadow-sm">
                  Matched
                </span>
              )}
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 mb-2">
                  <span>ID: #{product.id}</span>
                  <span className="bg-stone-200/60 px-1.5 py-0.5 rounded text-stone-600 font-semibold">{product.brand}</span>
                </div>
                <h3 className="text-sm font-bold text-stone-850 line-clamp-1">{product.name}</h3>
                
                {/* Hardware specs preview */}
                <div className="mt-2 text-[10px] text-stone-500 space-y-0.5">
                  <p>RAM: {product.ram} | Storage: {product.storage}</p>
                  <p className="truncate">CPU: {product.processor}</p>
                </div>
              </div>

              <p className="text-base font-extrabold text-amber-700 mt-4">${product.price}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductList;
