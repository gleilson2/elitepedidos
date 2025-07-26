import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, Trash2, ShoppingCart, Scale, User, CreditCard, Package, AlertCircle } from 'lucide-react';
import { useStore2Products } from '../../hooks/useStore2Products';
import { useStore2Sales, useStore2Cart } from '../../hooks/useStore2Sales';
import { useStore2PDVCashRegister } from '../../hooks/useStore2PDVCashRegister';
import { PesagemModal } from '../PDV/PesagemModal';
import { PDVOperator } from '../../types/pdv';

interface Store2PDVSalesScreenProps {
  operator?: PDVOperator;
  scaleHook?: any;
}

const Store2PDVSalesScreen: React.FC<Store2PDVSalesScreenProps> = ({ operator, scaleHook }) => {
  const { products, loading: productsLoading } = useStore2Products();
  const { createSale, loading: salesLoading } = useStore2Sales();
  const { currentRegister, isOpen: isCashRegisterOpen } = useStore2PDVCashRegister();
  
  const {
    items,
    discount,
    paymentInfo,
    addItem,
    removeItem,
    updateItemQuantity,
    setDiscount,
    updatePaymentInfo,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getTotal
  } = useStore2Cart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPesagemModal, setShowPesagemModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'acai', label: 'Açaí' },
    { id: 'sorvetes', label: 'Sorvetes' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'complementos', label: 'Complementos' },
    { id: 'sobremesas', label: 'Sobremesas' },
    { id: 'outros', label: 'Outros' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.is_active;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleProductClick = (product: any) => {
    if (product.is_weighable) {
      setSelectedProduct(product);
      setShowPesagemModal(true);
    } else {
      addItem(product, 1);
    }
  };

  const handleWeightConfirm = (weightInGrams: number) => {
    if (selectedProduct) {
      const weightInKg = weightInGrams / 1000;
      addItem(selectedProduct, 1, weightInKg);
    }
    setShowPesagemModal(false);
    setSelectedProduct(null);
  };

  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      alert('Adicione pelo menos um item ao carrinho');
      return;
    }

    if (!isCashRegisterOpen) {
      alert('Não é possível finalizar vendas sem um caixa aberto');
      return;
    }

    try {
      const saleData = {
        operator_id: operator?.id,
        customer_name: paymentInfo.customerName,
        customer_phone: paymentInfo.customerPhone,
        subtotal: getSubtotal(),
        discount_amount: getDiscountAmount(),
        discount_percentage: discount.type === 'percentage' ? discount.value : 0,
        total_amount: getTotal(),
        payment_type: paymentInfo.method,
        change_amount: paymentInfo.changeFor || 0,
        notes: '',
        is_cancelled: false
      };

      const saleItems = items.map(item => ({
        product_id: item.product.id,
        product_code: item.product.code,
        product_name: item.product.name,
        quantity: item.quantity,
        weight_kg: item.weight,
        unit_price: item.product.unit_price,
        price_per_gram: item.product.price_per_gram,
        discount_amount: item.discount,
        subtotal: item.subtotal
      }));

      await createSale(saleData, saleItems, currentRegister?.id);
      
      clearCart();
      setShowPaymentModal(false);
      
      alert('Venda realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda. Tente novamente.');
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando produtos da Loja 2...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator size={24} className="text-blue-600" />
            PDV - Loja 2
          </h1>
          <div className="flex items-center gap-4">
            {operator && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{operator.name}</span>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCashRegisterOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isCashRegisterOpen ? 'Caixa Aberto' : 'Caixa Fechado'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Produtos */}
        <div className="flex-1 flex flex-col">
          {/* Filtros */}
          <div className="bg-white border-b p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  disabled={!isCashRegisterOpen}
                  className={`bg-white rounded-lg shadow-sm border p-4 text-left transition-all hover:shadow-md ${
                    !isCashRegisterOpen ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-bold text-lg">
                      {product.is_weighable && product.price_per_gram
                        ? `${formatPrice(product.price_per_gram * 1000)}/kg`
                        : formatPrice(product.unit_price || 0)
                      }
                    </span>
                    {product.is_weighable && (
                      <Scale size={16} className="text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum produto encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Carrinho */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={20} />
              Carrinho ({items.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded-full p-1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        {item.weight && (
                          <div className="text-xs text-gray-500">
                            {(item.weight * 1000).toFixed(0)}g
                          </div>
                        )}
                        <div className="font-semibold text-green-600">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totais e Finalização */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={!isCashRegisterOpen}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {isCashRegisterOpen ? 'Finalizar Venda' : 'Caixa Fechado'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pesagem */}
      {showPesagemModal && selectedProduct && (
        <PesagemModal
          produto={selectedProduct}
          onConfirmar={handleWeightConfirm}
          onFechar={() => {
            setShowPesagemModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Finalizar Venda - Loja 2</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente (opcional)
                </label>
                <input
                  type="text"
                  value={paymentInfo.customerName || ''}
                  onChange={(e) => updatePaymentInfo({ customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={paymentInfo.customerPhone || ''}
                  onChange={(e) => updatePaymentInfo({ customerPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="(85) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'dinheiro', label: 'Dinheiro' },
                    { value: 'pix', label: 'PIX' },
                    { value: 'cartao_credito', label: 'Cartão de Crédito' },
                    { value: 'cartao_debito', label: 'Cartão de Débito' }
                  ].map(method => (
                    <label key={method.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentInfo.method === method.value}
                        onChange={(e) => updatePaymentInfo({ method: e.target.value as any })}
                        className="text-blue-600"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {paymentInfo.method === 'dinheiro' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Troco para (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentInfo.changeFor || ''}
                    onChange={(e) => updatePaymentInfo({ changeFor: parseFloat(e.target.value) || undefined })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Valor para troco"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(getTotal())}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizeSale}
                disabled={salesLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {salesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  'Confirmar Venda'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store2PDVSalesScreen;