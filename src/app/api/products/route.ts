import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/database';
import * as googleSheets from '@/lib/google-sheets';
import { Product } from '@/types';

const USE_GOOGLE_SHEETS = process.env.USE_GOOGLE_SHEETS === 'true' && 
                          process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
                          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
                          process.env.GOOGLE_SHEETS_ID;

// GET - Ottieni tutti i prodotti
export async function GET() {
  try {
    if (USE_GOOGLE_SHEETS) {
      const products = await googleSheets.getProducts();
      return NextResponse.json(products);
    } else {
      const products = await allQuery<Product>('SELECT * FROM products ORDER BY name');
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Crea nuovo prodotto
export async function POST(request: NextRequest) {
  try {
    const product: Product = await request.json();
    
    if (USE_GOOGLE_SHEETS) {
      const newProduct = await googleSheets.addProduct({
        name: product.name,
        brand: product.brand || '',
        category: product.category || '',
        description: product.description || '',
        quantity: product.quantity || 0,
        minimum_stock: product.minimum_stock || 0,
        expiry_date: product.expiry_date || ''
      });
      return NextResponse.json(newProduct);
    } else {
      const result = await runQuery(
        'INSERT INTO products (name, brand, category, description, quantity, minimum_stock, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          product.name,
          product.brand || null,
          product.category || null,
          product.description || null,
          product.quantity || 0,
          product.minimum_stock || 0,
          product.expiry_date || null
        ]
      );
      
      return NextResponse.json({ id: result.id, ...product });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
