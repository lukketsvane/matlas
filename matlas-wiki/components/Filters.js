'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from 'lucide-react';

export default function Filters({ categories, selectedCategory, setSelectedCategory, selectedSubcategory, setSelectedSubcategory, advancedSearch, setAdvancedSearch, resetFilters, applyFilters }) {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className={`filters-container ${showFilters ? 'block' : 'hidden'} md:block md:ml-8 w-full md:w-1/4`}>
      <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="md:hidden">
        <Filter className="mr-2 h-4 w-4" />
        Filters
      </Button>
      <div className="bg-card p-4 rounded-md shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">Filters</h3>
        <div className="grid gap-4 mb-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {Object.keys(categories).map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCategory !== 'all' && (
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subcategories</SelectItem>
                  {categories[selectedCategory]?.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-base font-semibold">Search in:</Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(advancedSearch).map(([key, value]) => (
              <Label key={key} className="flex items-center space-x-2">
                <Checkbox
                  checked={value}
                  onCheckedChange={(checked) => setAdvancedSearch({ ...advancedSearch, [key]: checked })}
                />
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
              </Label>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={resetFilters} variant="outline" className="mr-2">
            <Filter className="mr-2 h-4 w-4" />
          </Button>
          <Button onClick={applyFilters}>Filters</Button>
        </div>
      </div>
    </div>
  );
}
