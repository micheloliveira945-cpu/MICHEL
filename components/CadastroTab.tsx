import React, { useState, useEffect } from 'react';
import type { Vehicle, Claim } from '../types';
import { Save, PlusCircle, Trash2 } from 'lucide-react';

interface CadastroTabProps {
  baseVehicles: Vehicle[];
  claims: Claim[];
  onAddClaim: (claim: Claim) => void;
}

const initialFormState = {
  id: '',
  dataExecucao: new Date().toISOString().split('T')[0],
  motorista: '',
  responsavel: 'Orleando Emmanuel da Silva',
  placa: '',
  marca: '',
  modelo: '',
  classificacao: '',
  cor: '',
  culpabilidade: 'Não' as 'Sim' | 'Não',
  valor: 0,
  observacoes: '',
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
    />
  </div>
);

export const CadastroTab: React.FC<CadastroTabProps> = ({ baseVehicles, claims, onAddClaim }) => {
  const [formData, setFormData] = useState<Omit<Claim, 'id'> & { id?: string }>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.placa) {
      const vehicle = baseVehicles.find(v => v.placa.toLowerCase() === formData.placa.toLowerCase());
      if (vehicle) {
        setFormData(prev => ({ ...prev, ...vehicle }));
      } else {
        setFormData(prev => ({
          ...prev,
          marca: '',
          modelo: '',
          classificacao: '',
          cor: '',
        }));
      }
    }
  }, [formData.placa, baseVehicles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setFormData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa || !formData.dataExecucao || !formData.motorista) {
        setFormError('Preencha todos os campos obrigatórios: Placa, Data da Execução e Motorista.');
        return;
    }
    const vehicleData = baseVehicles.find(v => v.placa === formData.placa);
    if (!vehicleData) {
        setFormError('Placa não encontrada na base de veículos. Verifique a placa ou importe o veículo na aba "Base".');
        return;
    }

    setFormError(null);
    onAddClaim({ ...formData, ...vehicleData, id: new Date().toISOString() });
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-8">
       <div>
         <h2 className="text-xl font-bold text-gray-800 mb-1">Cadastrar Novo Sinistro</h2>
         <p className="text-gray-500">Preencha os detalhes abaixo para registrar um novo sinistro.</p>
       </div>
      <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField label="Data da Execução" type="date" name="dataExecucao" value={formData.dataExecucao} onChange={handleChange} required />
          <InputField label="Motorista" type="text" name="motorista" value={formData.motorista} onChange={handleChange} required />
          <InputField label="Responsável pelo Atendimento" type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} disabled />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t">
            <InputField label="Placa" type="text" name="placa" value={formData.placa} onChange={handlePlacaChange} list="placas" required placeholder="Digite para buscar" />
            <datalist id="placas">
              {baseVehicles.map(v => <option key={v.placa} value={v.placa} />)}
            </datalist>
            <InputField label="Marca" type="text" name="marca" value={formData.marca} disabled />
            <InputField label="Modelo" type="text" name="modelo" value={formData.modelo} disabled />
            <InputField label="Classificação" type="text" name="classificacao" value={formData.classificacao} disabled />
            <InputField label="Cor" type="text" name="cor" value={formData.cor} disabled />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Culpabilidade</label>
            <select name="culpabilidade" value={formData.culpabilidade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option>Não</option>
              <option>Sim</option>
            </select>
          </div>
          <InputField label="Valor (R$)" type="number" name="valor" value={formData.valor} onChange={handleChange} step="0.01" min="0" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
        </div>

        {formError && (
             <div className="text-red-600 bg-red-100 p-3 rounded-md text-sm">{formError}</div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 px-5 py-2 text-white font-semibold rounded-lg shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" style={{ backgroundColor: '#004aad' }}>
            <Save size={18} />
            Salvar Cadastro
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Documentos Salvos</h3>
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Placa</th>
                <th className="px-6 py-3">Marca</th>
                <th className="px-6 py-3">Modelo</th>
                <th className="px-6 py-3">Classificação</th>
                <th className="px-6 py-3">Motorista</th>
                <th className="px-6 py-3">Valor (R$)</th>
                <th className="px-6 py-3">Culpabilidade</th>
                <th className="px-6 py-3">Observações</th>
              </tr>
            </thead>
            <tbody>
              {claims.length > 0 ? (
                claims.map(claim => (
                  <tr key={claim.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(claim.dataExecucao + 'T00:00:00').toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{claim.placa}</td>
                    <td className="px-6 py-4">{claim.marca}</td>
                    <td className="px-6 py-4">{claim.modelo}</td>
                    <td className="px-6 py-4">{claim.classificacao}</td>
                    <td className="px-6 py-4">{claim.motorista}</td>
                    <td className="px-6 py-4">{claim.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${claim.culpabilidade === 'Sim' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {claim.culpabilidade}
                        </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs whitespace-pre-wrap break-words">{claim.observacoes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">
                    Nenhum sinistro cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};