'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

export default function Filters({ categories, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, advancedSearch, setAdvancedSearch, resetFilters }) {
  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedCategory === 'all' ? 'All categories' : selectedCategory}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSelectedCategory('all')}>
            All categories
          </DropdownMenuItem>
          {Object.keys(categories).map(category => (
            <DropdownMenuItem key={category} onSelect={() => setSelectedCategory(category)}>
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCategory !== 'all' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedSubcategory === 'all' ? 'All subcategories' : selectedSubcategory}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Subcategory</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setSelectedSubcategory('all')}>
              All subcategories
            </DropdownMenuItem>
            {categories[selectedCategory]?.map(subcategory => (
              <DropdownMenuItem key={subcategory} onSelect={() => setSelectedSubcategory(subcategory)}>
                {subcategory}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div>
        <Label className="mb-2 block">Search in:</Label>
        <div className="space-y-2">
          {Object.entries(advancedSearch).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <Checkbox
                id={`search-${key}`}
                checked={value}
                onCheckedChange={(checked) => setAdvancedSearch({ ...advancedSearch, [key]: checked })}
                className="mr-2"
              />
              <Label htmlFor={`search-${key}`} className="text-sm cursor-pointer">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={resetFilters} variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}