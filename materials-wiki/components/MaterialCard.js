import { supabase } from '../lib/db';
import Link from 'next/link';

async function getMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*');
  if (error) throw new Error('Failed to fetch materials');
  return data;
}

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Materials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <Link href={`/materials/${material.id}`} key={material.id}>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">{material.name}</h2>
              <p className="text-muted-foreground">{material.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}