// components/MaterialTabs.js
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function MaterialTabs({ material }) {
  return (
    <Tabs defaultValue="properties" className="mt-8">
      <TabsList>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="usage">Usage Examples</TabsTrigger>
        <TabsTrigger value="history">Edit History</TabsTrigger>
      </TabsList>
      <TabsContent value="properties">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(material.properties || {}).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="usage">
        {material.usage_examples && material.usage_examples.map((example, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold">{example.title}</h3>
            <MarkdownRenderer content={example.description} />
          </div>
        ))}
      </TabsContent>
      <TabsContent value="history">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Editor</TableHead>
              <TableHead>Changes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {material.edit_history && material.edit_history.map((edit, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(edit.date).toLocaleDateString()}</TableCell>
                <TableCell>{edit.editor}</TableCell>
                <TableCell>{edit.changes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}