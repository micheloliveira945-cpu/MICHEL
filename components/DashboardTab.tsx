

import React, { useState, useEffect } from 'react';
import type { Vehicle, Claim } from '../types';
import { Car, FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface DashboardTabProps {
  vehicles: Vehicle[];
  claims: Claim[];
}

interface BarChartProps {
  title: string;
  data: { label: string; value: number; color?: string }[];
  maxHeight?: number;
}

const BarChart: React.FC<BarChartProps> = ({ title, data, maxHeight = 150 }) => {
  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-4">Nenhum dado para exibir no gráfico.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  // Ensure that maxValue is at least 1 to prevent division by zero for height calculation if all values are 0
  const effectiveMaxValue = maxValue > 0 ? maxValue : 1; 

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-end justify-around h-auto min-h-[150px] gap-2 p-2 bg-gray-50 rounded-md">
        {data.map((item, index) => (
          <div key={item.label || index} className="flex flex-col items-center flex-grow-0 flex-shrink-0 w-1/5 sm:w-1/6 md:w-1/8 lg:w-1/12 max-w-[80px]">
            <div
              className={`w-full rounded-t-sm ${item.color || 'bg-blue-600'} transition-all duration-300 ease-out flex items-end justify-center`}
              style={{ height: `${(item.value / effectiveMaxValue) * maxHeight}px` }}
              title={`${item.label}: ${item.value}`}
            >
              <span className="text-xs text-white p-1 font-semibold">{item.value > 0 ? item.value : ''}</span>
            </div>
            <span className="text-xs text-gray-600 mt-1 text-center truncate w-full">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


export const DashboardTab: React.FC<DashboardTabProps> = ({ vehicles, claims }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'MM' (e.g., '01' for January)
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  // Get all unique years from claims for dynamic year filtering
  const allClaimYears = Array.from(new Set(claims.map(claim => new Date(claim.dataExecucao).getFullYear()))).sort((a, b) => a - b);
  const yearOptions = allClaimYears.length > 0 ? allClaimYears : [currentYear]; // Fallback to current year if no claims

  const filteredClaims = claims.filter(claim => {
    const claimDate = new Date(claim.dataExecucao + 'T00:00:00'); // Add T00:00:00 to avoid timezone issues
    const claimMonth = (claimDate.getMonth() + 1).toString().padStart(2, '0'); // '01'-'12'
    const claimYear = claimDate.getFullYear().toString();

    const matchesMonth = selectedMonth === 'all' || claimMonth === selectedMonth;
    const matchesYear = selectedYear === 'all' || claimYear === selectedYear;

    return matchesMonth && matchesYear;
  });

  // Data aggregation for KPIs
  const totalVehicles = new Set(vehicles.map(v => v.placa)).size;
  const totalClaims = filteredClaims.length;

  const culpabilitySim = filteredClaims.filter(claim => claim.culpabilidade === 'Sim').length;
  const culpabilityNao = filteredClaims.filter(claim => claim.culpabilidade === 'Não').length;

  // Fix: Corrected the reduce callback function signature from (sum, claim => ...) to (sum, claim) => ...
  const totalClaimsValue = filteredClaims.reduce((sum, claim) => sum + (Number(claim.valor) || 0), 0);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Data for "Total de Sinistros por Período" Chart
  const claimsByPeriodData = () => {
    if (selectedMonth === 'all') {
      // Group by month for the selected year
      const monthlyCounts: Record<string, number> = {};
      Array.from({ length: 12 }, (_, i) => {
        const monthNum = (i + 1).toString().padStart(2, '0');
        monthlyCounts[monthNum] = 0; // Initialize all months to 0
      });

      filteredClaims.forEach(claim => {
        const claimDate = new Date(claim.dataExecucao);
        const monthKey = (claimDate.getMonth() + 1).toString().padStart(2, '0');
        if (monthlyCounts.hasOwnProperty(monthKey)) { // Ensure monthKey is valid
            monthlyCounts[monthKey]++;
        }
      });

      return Object.keys(monthlyCounts).sort().map(monthKey => ({
        label: new Date(0, parseInt(monthKey) - 1).toLocaleString('pt-BR', { month: 'short' }),
        value: monthlyCounts[monthKey],
      }));
    } else {
      // Group by day for the selected month and year
      const dailyCounts: Record<string, number> = {};
      const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString().padStart(2, '0');
        dailyCounts[day] = 0; // Initialize all days to 0
      });

      filteredClaims.forEach(claim => {
        const claimDate = new Date(claim.dataExecucao);
        const dayKey = claimDate.getDate().toString().padStart(2, '0');
        if (dailyCounts.hasOwnProperty(dayKey)) { // Ensure dayKey is valid
            dailyCounts[dayKey]++;
        }
      });

      return Object.keys(dailyCounts).sort((a, b) => parseInt(a) - parseInt(b)).map(dayKey => ({
        label: dayKey,
        value: dailyCounts[dayKey],
      }));
    }
  };

  // Data for "Culpabilidade dos Sinistros" Chart
  const culpabilityChartData = [
    { label: 'Sim', value: culpabilitySim, color: 'bg-red-600' },
    { label: 'Não', value: culpabilityNao, color: 'bg-green-600' },
  ];

  // Data for "Evolução dos Sinistros" Chart
  const claimsEvolutionData = () => {
    if (selectedYear === 'all') {
      // Evolution by year across all claims
      const yearlyCounts: Record<string, number> = {};
      const yearsInClaims = Array.from(new Set(claims.map(claim => new Date(claim.dataExecucao).getFullYear())));
      const minYear = yearsInClaims.length > 0 ? Math.min(...yearsInClaims) : currentYear;
      const maxYear = yearsInClaims.length > 0 ? Math.max(...yearsInClaims) : currentYear;

      for (let y = minYear; y <= maxYear; y++) {
        yearlyCounts[y.toString()] = 0;
      }

      claims.forEach(claim => {
        const yearKey = new Date(claim.dataExecucao).getFullYear().toString();
        if (yearlyCounts.hasOwnProperty(yearKey)) {
          yearlyCounts[yearKey]++;
        }
      });

      return Object.keys(yearlyCounts).sort().map(yearKey => ({
        label: yearKey,
        value: yearlyCounts[yearKey],
        color: 'bg-purple-600'
      }));
    } else if (selectedMonth === 'all') {
      // Evolution by month for the selected year (using filteredClaims which are already by year)
      const monthlyCounts: Record<string, number> = {};
      Array.from({ length: 12 }, (_, i) => {
        const monthNum = (i + 1).toString().padStart(2, '0');
        monthlyCounts[monthNum] = 0;
      });

      filteredClaims.forEach(claim => {
        const monthKey = (new Date(claim.dataExecucao).getMonth() + 1).toString().padStart(2, '0');
        if (monthlyCounts.hasOwnProperty(monthKey)) {
          monthlyCounts[monthKey]++;
        }
      });

      return Object.keys(monthlyCounts).sort().map(monthKey => ({
        label: new Date(0, parseInt(monthKey) - 1).toLocaleString('pt-BR', { month: 'short' }),
        value: monthlyCounts[monthKey],
        color: 'bg-purple-600'
      }));
    } else {
      // Evolution by day for the selected month and year (using filteredClaims)
      const dailyCounts: Record<string, number> = {};
      const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dayKey = d.toString().padStart(2, '0');
        dailyCounts[dayKey] = 0;
      }

      filteredClaims.forEach(claim => {
        const dayKey = new Date(claim.dataExecucao).getDate().toString().padStart(2, '0');
        if (dailyCounts.hasOwnProperty(dayKey)) {
          dailyCounts[dayKey]++;
        }
      });

      return Object.keys(dailyCounts).sort((a, b) => parseInt(a) - parseInt(b)).map(dayKey => ({
        label: dayKey,
        value: dailyCounts[dayKey],
        color: 'bg-purple-600'
      }));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Visão Geral do Sinistro</h2>
        <p className="text-gray-500">Dados e estatísticas para sua frota e sinistros.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label htmlFor="month-select" className="sr-only">Filtrar por Mês</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Meses</option>
          {Array.from({ length: 12 }, (_, i) => {
            const month = (i + 1).toString().padStart(2, '0');
            const monthName = new Date(currentYear, i).toLocaleString('pt-BR', { month: 'long' });
            return <option key={month} value={month}>{monthName}</option>;
          })}
        </select>

        <label htmlFor="year-select" className="sr-only">Filtrar por Ano</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Anos</option>
          {yearOptions.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Card: Total Vehicles */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Veículos na Base</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{totalVehicles}</p>
          </div>
          <Car size={36} className="text-blue-400" />
        </div>

        {/* Card: Total Claims */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sinistros Registrados</p>
            <p className="text-3xl font-bold text-indigo-700 mt-1">{totalClaims}</p>
          </div>
          <FileText size={36} className="text-indigo-400" />
        </div>

        {/* Card: Claims with Culpability 'Sim' */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sinistros com Culpabilidade (Sim)</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{culpabilitySim}</p>
          </div>
          <XCircle size={36} className="text-red-400" />
        </div>

        {/* Card: Claims with Culpability 'Não' */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Sinistros com Culpabilidade (Não)</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{culpabilityNao}</p>
          </div>
          <CheckCircle size={36} className="text-green-400" />
        </div>

        {/* Card: Total Claims Value */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between col-span-1 sm:col-span-2 xl:col-span-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor Total dos Sinistros</p>
            <p className="text-3xl font-bold text-purple-700 mt-1">{formatCurrency(totalClaimsValue)}</p>
          </div>
          <DollarSign size={36} className="text-purple-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Chart: Total de Sinistros por Período */}
        <BarChart title="Total de Sinistros por Período" data={claimsByPeriodData()} />

        {/* Chart: Culpabilidade dos Sinistros */}
        <BarChart title="Culpabilidade dos Sinistros" data={culpabilityChartData} />

        {/* New Chart: Evolução dos Sinistros */}
        <BarChart title="Evolução dos Sinistros" data={claimsEvolutionData()} />
      </div>
    </div>
  );
};