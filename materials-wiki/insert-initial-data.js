const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Role Key:', supabaseServiceRoleKey);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function insertMaterial() {
  const materialData = {
    name: 'Titanium Alloy',
    description: 'A strong and lightweight metal',
    properties: {
      "Density": "4.5 g/cm³",
      "Melting Point": "1,668°C",
      "Tensile Strength": "900 MPa",
      "Hardness": "36 HRC",
      "Thermal Conductivity": "21.9 W/m·K",
      "Corrosion Resistance": "Excellent"
    },
    usage_examples: [
      {
        "title": "Aerospace",
        "description": "Titanium alloys are widely used in aircraft and spacecraft due to their high strength-to-weight ratio and corrosion resistance."
      },
      {
        "title": "Medical Implants",
        "description": "Titanium alloys are biocompatible and are commonly used in medical implants such as hip and knee replacements, dental implants, and pacemaker cases."
      },
      {
        "title": "Automotive",
        "description": "Titanium alloys are used in high-performance automotive applications, such as engine components, suspension parts, and exhaust systems, due to their strength and low weight."
      }
    ],
    edit_history: [
      {
        "date": "2024-06-15",
        "editor": "John Doe",
        "changes": "Updated tensile strength and hardness values."
      },
      {
        "date": "2024-05-20",
        "editor": "Jane Smith",
        "changes": "Added information about medical implant applications."
      },
      {
        "date": "2024-04-01",
        "editor": "Bob Johnson",
        "changes": "Initial creation of the material page."
      }
    ],
    related_materials: [
      {
        "name": "Stainless Steel",
        "description": "A corrosion-resistant alloy with a wide range of applications."
      },
      {
        "name": "Aluminum Alloy",
        "description": "A lightweight and versatile metal with excellent corrosion resistance."
      },
      {
        "name": "Carbon Fiber",
        "description": "A strong and lightweight composite material with numerous applications."
      }
    ]
  };

  const { data, error } = await supabase
    .from('materials')
    .insert([materialData]);

  if (error) {
    console.error('Error inserting material:', error);
  } else {
    console.log('Material inserted successfully:', data);
  }
}

insertMaterial().catch(console.error);