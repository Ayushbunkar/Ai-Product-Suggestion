import React from "react";

function InputForm({ query, setQuery, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-2">
          Your Shopping Preference
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., I want an Android smartphone under 40,000 rupees..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 text-stone-800 placeholder-stone-400 outline-none transition-all text-sm resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-900/10 active:scale-[0.98] transition-colors cursor-pointer"
      >
        Get Recommendations
      </button>
    </form>
  );
}

export default InputForm;
