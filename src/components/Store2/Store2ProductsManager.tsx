import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Store2Product {
  id: string;
  code: string;
  name: string;
  category: 'acai' | 'bebidas' | 'complementos' | 'sobremesas' | 'outros' | 'sorvetes';
  is_weighable: boolean;
  unit_price?: number;
  price_per_gram?: number;
  image_url?: string;
  stock_quantity: number;
  min_stock: number;
  is_active: boolean;
  barcode?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useStore2Products = () => {
  const [products, setProducts] = useState<Store2Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos da Loja 2...');
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl === 'your_supabase_url_here' || 
          supabaseKey === 'your_supabase_anon_key_here' ||
          supabaseUrl.includes('placeholder')) {
        console.warn('⚠️ Supabase não configurado - usando produtos de demonstração para Loja 2');
        
        // Fallback para produtos de demonstração
        const demoProducts: Store2Product[] = [
          {
            id: 'loja2-acai-pequeno',
            code: 'L2AC001',
            name: 'Açaí Pequeno 250ml - Loja 2',
            category: 'acai',
            is_weighable: false,
            unit_price: 12.90,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 100,
            min_stock: 10,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional pequeno 250ml exclusivo da Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-acai-1kg-loja2',
            code: 'ACAI1KGL2',
            name: 'Açaí 1kg (Pesável) - Loja 2',
            category: 'acai',
            is_weighable: true,
            unit_price: undefined,
            price_per_gram: 0.04499,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 50,
            min_stock: 5,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional vendido por peso - Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-sorvete-300-loja2',
            code: 'SORV300L2',
            name: 'Sorvete 300ml - Loja 2',
            category: 'sorvetes',
            is_weighable: false,
            unit_price: 14.90,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 80,
            min_stock: 10,
            is_active: true,
            barcode: '',
            description: 'Sorvete cremoso 300ml - Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-bebida-loja2',
            code: 'BEB001L2',
            name: 'Água Mineral 500ml - Loja 2',
            category: 'bebidas',
            is_weighable: false,
            unit_price: 3.50,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 200,
            min_stock: 20,
            is_active: true,
            barcode: '',
            description: 'Água mineral 500ml gelada - Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-acai-500-loja2',
            code: 'ACAI500L2',
            name: 'Açaí 500ml - Loja 2',
            category: 'acai',
            is_weighable: false,
            unit_price: 22.90,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 100,
            min_stock: 10,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional 500ml - Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setProducts(demoProducts);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('store2_products')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Se não há produtos no banco, usar produtos de demonstração
      if (!data || data.length === 0) {
        console.warn('⚠️ Nenhum produto encontrado no banco da Loja 2 - usando produtos de demonstração');
        const demoProducts: Store2Product[] = [
          {
            id: 'loja2-acai-pequeno',
            code: 'L2AC001',
            name: 'Açaí Pequeno 250ml - Loja 2',
            category: 'acai',
            is_weighable: false,
            unit_price: 12.90,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 100,
            min_stock: 10,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional pequeno 250ml exclusivo da Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'loja2-acai-medio',
            code: 'L2AC002',
            name: 'Açaí Médio 400ml - Loja 2',
            category: 'acai',
            is_weighable: false,
            unit_price: 18.90,
            price_per_gram: undefined,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 100,
            min_stock: 10,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional médio 400ml exclusivo da Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'loja2-acai-grande',
            code: 'L2AC003',
            name: 'Açaí Grande 600ml - Loja 2',
            category: 'acai',
            is_weighable: true,
            unit_price: undefined,
            price_per_gram: 0.04499,
            image_url: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
            stock_quantity: 50,
            min_stock: 5,
            is_active: true,
            barcode: '',
            description: 'Açaí tradicional vendido por peso - Loja 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setProducts(demoProducts);
      } else {
        setProducts(data);
      }
      
      console.log(`✅ ${data?.length || 0} produtos da Loja 2 carregados`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
      console.error('❌ Erro ao carregar produtos da Loja 2:', errorMessage);
      setError(errorMessage);
      
      // Fallback para produtos de demonstração em caso de erro
      const { products: store1Products } = await import('../data/products');
      const mappedProducts = store1Products.map(product => ({
        id: `loja2-${product.id}`,
        code: `L2-${product.id.toUpperCase()}`,
        name: `${product.name} - Loja 2`,
        category: product.category as Store2Product['category'],
        is_weighable: product.is_weighable || false,
        unit_price: product.price,
        price_per_gram: product.pricePerGram,
        image_url: product.image,
        stock_quantity: 100,
        min_stock: 10,
        is_active: product.isActive !== false,
        barcode: '',
        description: `${product.description} - Exclusivo Loja 2`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      setProducts(mappedProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncProductsFromStore1 = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando produtos da Loja 1 para Loja 2...');
      
      // Buscar produtos da Loja 1 (delivery_products)
      const { data: store1Products, error: store1Error } = await supabase
        .from('delivery_products')
        .select('*')
        .eq('is_active', true);
        
      if (store1Error) {
        console.error('Erro ao buscar produtos da Loja 1:', store1Error);
        return;
      }
      
      if (!store1Products || store1Products.length === 0) {
        console.log('Nenhum produto encontrado na Loja 1 para sincronizar');
        return;
      }
      
      // Mapear produtos da Loja 1 para formato da Loja 2
      const store2Products = store1Products.map(product => ({
        code: `L2-${product.name.substring(0, 10).toUpperCase().replace(/\s/g, '')}`,
        name: product.name,
        category: product.category,
        is_weighable: product.is_weighable || false,
        unit_price: product.price,
        price_per_gram: product.price_per_gram,
        image_url: product.image_url,
        stock_quantity: 100,
        min_stock: 10,
        is_active: true,
        barcode: '',
        description: product.description
      }));
      
      // Inserir produtos na tabela da Loja 2
      const { error: insertError } = await supabase
        .from('store2_products')
        .insert(store2Products);
        
      if (insertError) {
        console.error('Erro ao inserir produtos na Loja 2:', insertError);
        return;
      }
      
      console.log(`✅ ${store2Products.length} produtos sincronizados para Loja 2`);
    } catch (err) {
      console.error('Erro na sincronização de produtos:', err);
    }
  }, []);

  const syncWithStore1 = useCallback(async () => {
    console.log('🔄 Forçando sincronização com produtos da Loja 1...');
    await syncProductsFromStore1();
    await fetchProducts();
  }, [syncProductsFromStore1, fetchProducts]);

  const createProduct = useCallback(async (product: Omit<Store2Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🚀 Criando produto na Loja 2:', product);
      
      const { data, error } = await supabase
        .from('store2_products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      console.log('✅ Produto da Loja 2 criado:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar produto da Loja 2:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar produto');
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Store2Product>) => {
    try {
      console.log('✏️ Atualizando produto da Loja 2:', id, updates);
      
      const { data, error } = await supabase
        .from('store2_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      console.log('✅ Produto da Loja 2 atualizado:', data);
      return data;
    } catch (err) {
      console.error('❌ Erro ao atualizar produto da Loja 2:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Excluindo produto da Loja 2:', id);
      
      const { error } = await supabase
        .from('store2_products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
      console.log('✅ Produto da Loja 2 excluído');
    } catch (err) {
      console.error('❌ Erro ao excluir produto da Loja 2:', err);
      throw new Error(err instanceof Error ? err.message : 'Erro ao excluir produto');
    }
  }, []);

  const searchProducts = useCallback((query: string) => {
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.code.toLowerCase().includes(searchTerm) ||
      product.barcode?.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    refetch: fetchProducts,
    syncWithStore1
  };
};