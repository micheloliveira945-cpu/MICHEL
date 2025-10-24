
import React, { useState, useEffect } from 'react';
import { BaseTab } from './components/BaseTab';
import { CadastroTab } from './components/CadastroTab';
import { DashboardTab } from './components/DashboardTab'; // Importa o novo componente
import type { Vehicle, Claim } from './types';
import { Database, FileText, PieChart } from 'lucide-react'; // Importa PieChart para o ícone

type Tab = 'base' | 'cadastro' | 'dashboard'; // Adiciona 'dashboard' ao tipo Tab

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('base');

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const savedVehicles = localStorage.getItem('sinistros_vehicles');
      return savedVehicles ? JSON.parse(savedVehicles) : [];
    } catch (error) {
      console.error("Failed to load vehicles from localStorage", error);
      return [];
    }
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const savedClaims = localStorage.getItem('sinistros_claims');
      return savedClaims ? JSON.parse(savedClaims) : [];
    } catch (error) {
      console.error("Failed to load claims from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sinistros_vehicles', JSON.stringify(vehicles));
    } catch (error) {
      console.error("Failed to save vehicles to localStorage", error);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('sinistros_claims', JSON.stringify(claims));
    } catch (error) {
      console.error("Failed to save claims to localStorage", error);
    }
  }, [claims]);


  const handleAddClaim = (claim: Claim) => {
    setClaims(prevClaims => [...prevClaims, claim]);
  };

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
        activeTab === tabName
          ? 'text-white bg-blue-700 rounded-t-lg'
          : 'text-gray-600 hover:bg-gray-200 rounded-t-lg'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Controle de Sinistros</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex border-b border-gray-300">
          <TabButton tabName="base" label="Base" icon={<Database size={18} />} />
          <TabButton tabName="cadastro" label="Cadastro" icon={<FileText size={18} />} />
          <TabButton tabName="dashboard" label="Dashboard" icon={<PieChart size={18} />} /> {/* Novo botão da aba */}
        </div>

        <div className="bg-white shadow-lg rounded-b-lg rounded-tr-lg p-6 mt-[-1px]">
          {activeTab === 'base' && <BaseTab vehicles={vehicles} setVehicles={setVehicles} />}
          {activeTab === 'cadastro' && (
            <CadastroTab
              baseVehicles={vehicles}
              claims={claims}
              onAddClaim={handleAddClaim}
            />
          )}
          {activeTab === 'dashboard' && <DashboardTab claims={claims} />} {/* Renderização do novo componente */}
        </div>
      </main>
    </div>
  );
};

export default App;