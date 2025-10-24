import React, { useState, useEffect } from 'react';
import { BaseTab } from './components/BaseTab';
import { CadastroTab } from './components/CadastroTab';
import { DashboardTab } from './components/DashboardTab'; // Import the new DashboardTab
import type { Vehicle, Claim } from './types';
import { Database, FileText, BarChart2 } from 'lucide-react'; // Import BarChart2 icon

type Tab = 'base' | 'cadastro' | 'dashboard'; // Add 'dashboard' to Tab type

const App: React.FC = () => {
  // Initialize state from localStorage or with empty arrays
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const storedVehicles = localStorage.getItem('vehiclesData');
      return storedVehicles ? JSON.parse(storedVehicles) : [];
    } catch (error) {
      console.error("Error parsing vehicles from localStorage", error);
      return [];
    }
  });
  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const storedClaims = localStorage.getItem('claimsData');
      return storedClaims ? JSON.parse(storedClaims) : [];
    } catch (error) {
      console.error("Error parsing claims from localStorage", error);
      return [];
    }
  });

  // Declare activeTab state and its setter
  const [activeTab, setActiveTab] = useState<Tab>('base');

  // Save vehicles to localStorage whenever the vehicles state changes
  useEffect(() => {
    localStorage.setItem('vehiclesData', JSON.stringify(vehicles));
  }, [vehicles]);

  // Save claims to localStorage whenever the claims state changes
  useEffect(() => {
    localStorage.setItem('claimsData', JSON.stringify(claims));
  }, [claims]);

  const handleAddClaim = (claim: Claim) => {
    setClaims(prevClaims => [...prevClaims, claim]);
  };

  const handleUpdateClaim = (updatedClaim: Claim) => {
    setClaims(prevClaims =>
      prevClaims.map(claim => (claim.id === updatedClaim.id ? updatedClaim : claim))
    );
  };

  const handleDeleteClaim = (claimId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este sinistro?')) {
      setClaims(prevClaims => prevClaims.filter(claim => claim.id !== claimId));
    }
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
          <TabButton tabName="dashboard" label="Dashboard" icon={<BarChart2 size={18} />} /> {/* New Tab Button */}
        </div>

        <div className="bg-white shadow-lg rounded-b-lg rounded-tr-lg p-6 mt-[-1px]">
          {activeTab === 'base' && <BaseTab vehicles={vehicles} setVehicles={setVehicles} />}
          {activeTab === 'cadastro' && (
            <CadastroTab
              baseVehicles={vehicles}
              claims={claims}
              onAddClaim={handleAddClaim}
              onUpdateClaim={handleUpdateClaim} // Pass update function
              onDeleteClaim={handleDeleteClaim} // Pass delete function
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              vehicles={vehicles}
              claims={claims}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;