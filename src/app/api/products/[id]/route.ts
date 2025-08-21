import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/database';
import * as googleSheets from '@/lib/google-sheets';
import { Product } from '@/types';

const USE_GOOGLE_SHEETS = process.env.USE_GOOGLE_SHEETS === 'true' && 
                          process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
                          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
                          process.env.GOOGLE_SHEETS_ID;

// GET - Ottieni prodotto specifico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (USE_GOOGLE_SHEETS) {
      const products = await googleSheets.getProducts();
      const product = products.find(p => p.id === parseInt(id));
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    } else {
      const product = await getQuery<Product>('SELECT * FROM products WHERE id = ?', [id]);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - Aggiorna prodotto
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product: Product = await request.json();
    
    if (USE_GOOGLE_SHEETS) {
      const updatedProduct = await googleSheets.updateProduct(parseInt(id), {
        name: product.name,
        brand: product.brand || '',
        category: product.category || '',
        description: product.description || '',
        quantity: product.quantity || 0,
        minimum_stock: product.minimum_stock || 0,
        expiry_date: product.expiry_date || ''
      });
      return NextResponse.json(updatedProduct);
    } else {
      await runQuery(
        'UPDATE products SET name = ?, brand = ?, category = ?, description = ?, quantity = ?, minimum_stock = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [
          product.name,
          product.brand || null,
          product.category || null,
          product.description || null,
          product.quantity || 0,
          product.minimum_stock || 0,
          product.expiry_date || null,
          id
        ]
      );
      
      return NextResponse.json({ id, ...product });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Elimina prodotto
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (USE_GOOGLE_SHEETS) {
      await googleSheets.deleteProduct(parseInt(id));
      return NextResponse.json({ message: 'Product deleted successfully' });
    } else {
      await runQuery('DELETE FROM products WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
