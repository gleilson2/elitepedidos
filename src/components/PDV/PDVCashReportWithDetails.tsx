import React, { useState, useEffect } from 'react';
import { Calendar, Download, Printer, Filter, ChevronDown, ChevronUp, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { usePDVCashRegister } from '../../hooks/usePDVCashRegister';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';

interface CashRegisterWithSummary {
  id: string;
  opening_amount: number;
  closing_amount: number | null;
  difference: number | null;
  opened_at: string;
  closed_at: string | null;
  operator_id: string | null;
  operator_name?: string;
  summary?: {
    sales_total: number;
    delivery_total: number;
    other_income_total: number;
    total_expense: number;
    expected_balance: number;
  };
}

interface CashEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  payment_method: string;
  created_at: string;
}

const PDVCashReportWithDetails: React.FC = () => {
  const { getCashRegisterReport, operators, loading } = usePDVCashRegister();
  const { hasPermission } = usePermissions();
  const [registers, setRegisters] = useState<CashRegisterWithSummary[]>([]);
  const [entries, setEntries] = useState<{ [registerId: string]: CashEntry[] }>({});
  const [expandedRegisters, setExpandedRegisters] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [reportLoading, setReportLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const data = await getCashRegisterReport({
        startDate,
        endDate,
        operatorId: selectedOperator || undefined
      });
      
      // Filter by status
      const filteredData = data.filter(register => {
        if (statusFilter === 'open') return !register.closed_at;
        if (statusFilter === 'closed') return register.closed_at;
        return true;
      });
      
      setRegisters(filteredData);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const loadCashEntries = async (registerId: string) => {
    try {
      // This would need to be implemented in the hook
      // For now, we'll use a placeholder
      setEntries(prev => ({
        ...prev,
        [registerId]: []
      }));
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const toggleRegisterExpansion = (registerId: string) => {
    const newExpanded = new Set(expandedRegisters);
    if (newExpanded.has(registerId)) {
      newExpanded.delete(registerId);
    } else {
      newExpanded.add(registerId);
      if (!entries[registerId]) {
        loadCashEntries(registerId);
      }
    }
    setExpandedRegisters(newExpanded);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    loadReport();
  }, []);

  const totalSummary = registers.reduce((acc, register) => {
    const summary = register.summary || {
      sales_total: 0,
      delivery_total: 0,
      other_income_total: 0,
      total_expense: 0,
      expected_balance: 0
    };
    
    return {
      opening_amount: acc.opening_amount + register.opening_amount,
      sales_total: acc.sales_total + summary.sales_total,
      delivery_total: acc.delivery_total + summary.delivery_total,
      other_income_total: acc.other_income_total + summary.other_income_total,
      total_expense: acc.total_expense + summary.total_expense,
      expected_balance: acc.expected_balance + summary.expected_balance,
      closing_amount: acc.closing_amount + (register.closing_amount || 0),
      difference: acc.difference + (register.difference || 0)
    };
  }, {
    opening_amount: 0,
    sales_total: 0,
    delivery_total: 0,
    other_income_total: 0,
    total_expense: 0,
    expected_balance: 0,
    closing_amount: 0,
    difference: 0
  });

  return (
    <PermissionGuard hasPermission={hasPermission('can_view_cash_report') || hasPermission('can_view_cash_register')} showMessage={true}>
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatório Detalhado de Caixa</h1>
        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* Filters */}
      <div className="print:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operador
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os operadores</option>
              {operators.map(operator => (
                <option key={operator.id} value={operator.id}>
                  {operator.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="open">Abertos</option>
              <option value="closed">Fechados</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={loadReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {reportLoading ? 'Carregando...' : 'Aplicar Filtros'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor de Abertura</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalSummary.opening_amount)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(totalSummary.sales_total + totalSummary.delivery_total)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Esperado</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(totalSummary.expected_balance)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diferença Total</p>
              <p className={`text-2xl font-bold ${totalSummary.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(totalSummary.difference)}
              </p>
            </div>
            {totalSummary.difference >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Cash Registers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registros de Caixa</h2>
          <p className="text-sm text-gray-600">
            {registers.length} registro(s) encontrado(s)
          </p>
        </div>
        
        {loading || reportLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando relatório...</p>
          </div>
        ) : registers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum registro de caixa encontrado para o período selecionado.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {registers.map((register) => (
              <div key={register.id} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleRegisterExpansion(register.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          Caixa #{register.id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Aberto em: {formatDateTime(register.opened_at)}
                        </p>
                        {register.closed_at && (
                          <p className="text-sm text-gray-600">
                            Fechado em: {formatDateTime(register.closed_at)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Abertura</p>
                          <p className="font-medium">{formatPrice(register.opening_amount)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Vendas PDV</p>
                          <p className="font-medium text-green-600">
                            {formatPrice(register.summary?.sales_total || 0)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Delivery</p>
                          <p className="font-medium text-blue-600">
                            {formatPrice(register.summary?.delivery_total || 0)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Saldo Esperado</p>
                          <p className="font-medium">
                            {formatPrice(register.summary?.expected_balance || 0)}
                          </p>
                        </div>
                        
                        {register.closed_at && (
                          <>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Fechamento</p>
                              <p className="font-medium">{formatPrice(register.closing_amount || 0)}</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Diferença</p>
                              <p className={`font-medium ${(register.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPrice(register.difference || 0)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      register.closed_at 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {register.closed_at ? 'Fechado' : 'Aberto'}
                    </span>
                    
                    {expandedRegisters.has(register.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedRegisters.has(register.id) && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      Movimentações do Caixa
                    </h4>
                    
                    {/* Placeholder for entries - in a real implementation, this would fetch from the database */}
                    <div className="text-center py-4 text-gray-500">
                      <p>O histórico detalhado de movimentações está disponível no menu "Caixa" principal.</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Para visualizar todas as movimentações, acesse o menu "Caixas" e selecione o caixa desejado.
                      </p>
                    </div>
                    {/* Commented out until we have proper data fetching for historical entries
                    {entries[register.id]?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Hora
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Tipo
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Descrição
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Método
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {entries[register.id].map((entry) => (
                              <tr key={entry.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {formatDateTime(entry.created_at)}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    entry.type === 'income' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {entry.type === 'income' ? 'Entrada' : 'Saída'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {entry.description}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {entry.payment_method}
                                </td>
                                <td className="px-4 py-2 text-sm text-right">
                                  <span className={`font-medium ${
                                    entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {entry.type === 'income' ? '+' : '-'}
                                    {formatPrice(entry.amount)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    */}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f2f2f2;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .print-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .print-header p {
            font-size: 14px;
            color: #666;
          }
        }
      `}</style>
    </div>
    </PermissionGuard>
  );
};

export default PDVCashReportWithDetails;