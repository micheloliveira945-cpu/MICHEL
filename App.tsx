
import React, { useState } from 'react';
import { BaseTab } from './components/BaseTab';
import { CadastroTab } from './components/CadastroTab';
import type { Vehicle, Claim } from './types';
import { Database, FileText } from 'lucide-react';

type Tab = 'base' | 'cadastro';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('base');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

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
        </div>
      </main>
    </div>
  );
};

export default App;
