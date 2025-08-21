'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertTriangle, Euro } from 'lucide-react';
import { Product } from '@/types';

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: '',
    description: '',
    price_purchase: 0,
    price_sale: 0,
    quantity: 0,
    minimum_stock: 5,
    expiry_date: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          brand: '',
          category: '',
          description: '',
          price_purchase: 0,
          price_sale: 0,
          quantity: 0,
          minimum_stock: 5,
          expiry_date: ''
        });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (confirm('Sei sicura di voler eliminare questo prodotto?')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const isLowStock = (product: Product) => {
    return (product.quantity || 0) <= (product.minimum_stock || 0);
  };

  const isExpiringSoon = (product: Product) => {
    if (!product.expiry_date) return false;
    const today = new Date();
    const expiryDate = new Date(product.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(isLowStock);
  const expiringProducts = products.filter(isExpiringSoon);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Gestione Magazzino
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuovo Prodotto
        </button>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
        <div className="mb-6 space-y-3">
          {lowStockProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertTriangle className="w-5 h-5" />
                Prodotti con scorte basse ({lowStockProducts.length})
              </div>
              <div className="text-sm text-red-700">
                {lowStockProducts.map(p => p.name).join(', ')}
              </div>
            </div>
          )}
          
          {expiringProducts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
                <AlertTriangle className="w-5 h-5" />
                Prodotti in scadenza entro 30 giorni ({expiringProducts.length})
              </div>
              <div className="text-sm text-orange-700">
                {expiringProducts.map(p => p.name).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtri */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Cerca prodotto per nome o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Tutte le categorie</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Lista prodotti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
              isLowStock(product) ? 'border-red-300' : 
              isExpiringSoon(product) ? 'border-orange-300' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
                )}
                {product.category && (
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                )}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id!)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Quantità:</span>
                  <span className={`ml-1 font-medium ${
                    isLowStock(product) ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {product.quantity || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Min. stock:</span>
                  <span className="ml-1 text-gray-900">{product.minimum_stock || 0}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Euro className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">Acquisto:</span>
                  <span className="text-gray-900">€{product.price_purchase || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">Vendita:</span>
                  <span className="text-gray-900">€{product.price_sale || 0}</span>
                </div>
              </div>
              
              {product.expiry_date && (
                <div className="text-sm">
                  <span className="text-gray-500">Scadenza:</span>
                  <span className={`ml-1 ${
                    isExpiringSoon(product) ? 'text-orange-600 font-medium' : 'text-gray-900'
                  }`}>
                    {new Date(product.expiry_date).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
              
              {product.description && (
                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || filterCategory ? 'Nessun prodotto trovato' : 'Nessun prodotto nel magazzino'}
        </div>
      )}

      {/* Form modale */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Prodotto *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="es. Shampoo, Tinta, Accessori..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prezzo Acquisto (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_purchase || ''}
                    onChange={(e) => setFormData({ ...formData, price_purchase: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prezzo Vendita (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_sale || ''}
                    onChange={(e) => setFormData({ ...formData, price_sale: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantità
                  </label>
                  <input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Minimo
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_stock || ''}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Scadenza
                </label>
                <input
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      brand: '',
                      category: '',
                      description: '',
                      price_purchase: 0,
                      price_sale: 0,
                      quantity: 0,
                      minimum_stock: 5,
                      expiry_date: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  {editingProduct ? 'Aggiorna' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
