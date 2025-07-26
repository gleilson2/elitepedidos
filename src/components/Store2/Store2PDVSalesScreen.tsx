import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  CreditCard, 
  DollarSign,
  Scale,
  Package,
  User,
  Percent,
  X,
  Check,
  AlertCircle,
  Printer
} from 'lucide-react';
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
  const { products, loading: productsLoading, searchProducts } = useStore2Products();
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
    getTotal,
    itemCount
  } = useStore2Cart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedWeighableProduct, setSelectedWeighableProduct] = useState<any>(null);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'acai', label: 'Açaí' },
    { id: 'sorvetes', label: 'Sorvetes' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'complementos', label: 'Complementos' },
    { id: 'sobremesas', label: 'Sobremesas' },
    { id: 'outros', label: 'Outros' }
  ];

  const filteredProducts = React.useMemo(() => {
    let result = searchTerm ? searchProducts(searchTerm) : products;
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    return result.filter(p => p.is_active);
  }, [products, searchProducts, searchTerm, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddProduct = (product: any) => {
    if (product.is_weighable) {
      setSelectedWeighableProduct(product);
      setShowWeightModal(true);
    } else {
      addItem(product, 1);
    }
  };

  const handleWeightConfirm = (weightInGrams: number) => {
    if (selectedWeighableProduct) {
      const weightInKg = weightInGrams / 1000;
      addItem(selectedWeighableProduct, 1, weightInKg);
    }
    setShowWeightModal(false);
    setSelectedWeighableProduct(null);
  };

  const handleFinalizeSale = async () => {
    if (items.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a venda');
      return;
    }

    if (!isCashRegisterOpen || !currentRegister) {
      alert('Não é possível finalizar vendas sem um caixa aberto');
      return;
    }

    setProcessing(true);
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
        change_amount: paymentInfo.changeFor ? paymentInfo.changeFor - getTotal() : 0,
        notes: '',
        is_cancelled: false,
        channel: 'loja2'
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

      const sale = await createSale(saleData, saleItems, currentRegister.id);
      setLastSale(sale);
      
      // Limpar carrinho
      clearCart();
      
      // Mostrar modal de impressão
      setShowPrintModal(true);
      
      console.log('✅ Venda da Loja 2 finalizada com sucesso:', sale);
    } catch (error) {
      console.error('❌ Erro ao finalizar venda da Loja 2:', error);
      alert(`Erro ao finalizar venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!lastSale) return;

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Venda Loja 2 #${lastSale.sale_number}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; color: black !important; background: white !important; }
          body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; color: black; background: white; padding: 2mm; width: 76mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .small { font-size: 10px; }
          .separator { border-bottom: 1px dashed black; margin: 5px 0; padding-bottom: 5px; }
          .flex-between { display: flex; justify-content: space-between; align-items: center; }
        </style>
      </head>
      <body>
        <div class="center separator">
          <div class="bold" style="font-size: 16px;">ELITE AÇAÍ - LOJA 2</div>
          <div class="small">Rua Dois, 2130‑A</div>
          <div class="small">Residencial 1 - Cágado</div>
          <div class="small">Tel: (85) 98904-1010</div>
          <div class="small">CNPJ: 38.130.139/0001-22</div>
        </div>
        
        <div class="separator">
          <div class="bold center">=== CUPOM FISCAL - LOJA 2 ===</div>
          <div class="small">Venda: #${lastSale.sale_number}</div>
          <div class="small">Data: ${new Date(lastSale.created_at).toLocaleDateString('pt-BR')}</div>
          <div class="small">Hora: ${new Date(lastSale.created_at).toLocaleTimeString('pt-BR')}</div>
          ${operator ? `<div class="small">Operador: ${operator.name}</div>` : ''}
        </div>
        
        <div class="separator">
          <div class="bold small">ITENS:</div>
          ${items.map((item, index) => `
            <div style="margin-bottom: 8px;">
              <div class="bold">${item.product.name}</div>
              <div class="flex-between">
                <span class="small">${item.quantity}x ${formatPrice(item.product.unit_price || 0)}</span>
                <span class="small">${formatPrice(item.subtotal)}</span>
              </div>
              ${item.weight ? `<div class="small">Peso: ${(item.weight * 1000).toFixed(0)}g</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="separator">
          <div class="flex-between">
            <span>Subtotal:</span>
            <span>${formatPrice(getSubtotal())}</span>
          </div>
          ${getDiscountAmount() > 0 ? `
          <div class="flex-between">
            <span>Desconto:</span>
            <span>-${formatPrice(getDiscountAmount())}</span>
          </div>
          ` : ''}
          <div class="flex-between bold">
            <span>TOTAL:</span>
            <span>${formatPrice(getTotal())}</span>
          </div>
        </div>
        
        <div class="separator">
          <div class="bold small">PAGAMENTO:</div>
          <div class="small">Forma: ${getPaymentMethodLabel(paymentInfo.method)}</div>
          ${paymentInfo.changeFor ? `<div class="small">Troco para: ${formatPrice(paymentInfo.changeFor)}</div>` : ''}
        </div>
        
        <div class="center small">
          <div class="bold">Obrigado pela preferência!</div>
          <div>Elite Açaí - Loja 2</div>
          <div>Impresso: ${new Date().toLocaleString('pt-BR')}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'voucher': 'Voucher',
      'misto': 'Pagamento Misto'
    };
    return labels[method] || method;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calculator size={24} className="text-blue-600" />
            PDV - Vendas Loja 2
          </h2>
          <p className="text-gray-600">Sistema de vendas presenciais da Loja 2</p>
        </div>
        
        {itemCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              <span className="font-medium text-blue-800">
                {itemCount} item(s) - {formatPrice(getTotal())}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Busca e Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produtos da Loja 2..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Produtos da Loja 2 ({filteredProducts.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">
                      {product.is_weighable && product.price_per_gram
                        ? `${formatPrice(product.price_per_gram * 1000)}/kg`
                        : formatPrice(product.unit_price || 0)
                      }
                    </span>
                    {product.is_weighable && (
                      <Scale size={14} className="text-blue-600" />
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm transition-colors flex items-center justify-center gap-1">
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Nenhum produto encontrado' 
                    : 'Nenhum produto disponível na Loja 2'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              Carrinho ({itemCount})
            </h3>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
                <p className="text-gray-400 text-sm">Adicione produtos para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
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
                          className="bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                          className="bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-green-600 text-sm">
                          {formatPrice(item.subtotal)}
                        </div>
                        {item.weight && (
                          <div className="text-xs text-gray-500">
                            {(item.weight * 1000).toFixed(0)}g
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo e Finalização */}
          {items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="space-y-3">
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
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowDiscountModal(true)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Percent size={16} />
                    Aplicar Desconto
                  </button>
                  
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!isCashRegisterOpen || processing}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        {!isCashRegisterOpen ? 'Caixa Fechado' : 'Finalizar Venda'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pesagem */}
      {showWeightModal && selectedWeighableProduct && (
        <PesagemModal
          produto={selectedWeighableProduct}
          onConfirmar={handleWeightConfirm}
          onFechar={() => {
            setShowWeightModal(false);
            setSelectedWeighableProduct(null);
          }}
          useDirectScale={false}
        />
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Finalizar Venda - Loja 2</h3>
            </div>

            <div className="p-6 space-y-4">
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
                    Troco para quanto?
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentInfo.changeFor || ''}
                    onChange={(e) => updatePaymentInfo({ changeFor: parseFloat(e.target.value) || undefined })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Valor para troco"
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total a Pagar:</span>
                  <span className="text-green-600">{formatPrice(getTotal())}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleFinalizeSale();
                }}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão */}
      {showPrintModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Venda Finalizada - Loja 2</h3>
            </div>

            <div className="p-6 text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Venda #{lastSale.sale_number} realizada com sucesso!
              </h4>
              
              <p className="text-gray-600 mb-4">
                Total: {formatPrice(lastSale.total_amount)}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setLastSale(null);
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store2PDVSalesScreen;