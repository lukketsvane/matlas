'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function SearchBar({ searchTerm, setSearchTerm, handleSearch }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="">
    </form>
  );
}
