'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search materials..."
        className="w-full p-2 border rounded-l"
      />
      <button
        type="submit"
        className="text-white px-4 py-2 rounded-r"
      >
        Search
      </button>
    </form>
  );
}