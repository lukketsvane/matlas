import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export function MaterialCard({ material, onAddToProject }) {
  const stripHtmlTags = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="h-32 relative">
        {material.header_image ? (
          <Image 
            src={material.header_image}
            alt={material.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg">{material.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex flex-col flex-grow">
          <p className="text-sm text-muted-foreground mb-4 flex-grow">
            {stripHtmlTags(material.description).substring(0, 100)}...
          </p>
          <div className="flex justify-between items-center mt-auto">
            <Link href={`/materials/${material.slug}`}>
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
            {onAddToProject && (
              <Button variant="ghost" size="icon" onClick={() => onAddToProject(material)}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}