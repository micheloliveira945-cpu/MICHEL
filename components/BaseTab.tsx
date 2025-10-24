import React, { useRef, useState, useEffect } from 'react';
import type { Vehicle } from '../types';
import { Upload, FileCheck, AlertTriangle } from 'lucide-react';

interface BaseTabProps {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

declare const XLSX: any;

export const BaseTab: React.FC<BaseTabProps> = ({ vehicles, setVehicles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Effect to automatically dismiss notification after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, {
            header: ["placa", "marca", "modelo", "classificacao", "cor"],
            range: 1
        });
        
        const importedVehicles: Vehicle[] = json.map((row: any) => ({
          placa: String(row.placa || '').toUpperCase(),
          marca: String(row.marca || ''),
          modelo: String(row.modelo || ''),
          classificacao: String(row.classificacao || ''),
          cor: String(row.cor || ''),
        })).filter(v => v.placa);

        const uniquePlates = new Set(importedVehicles.map(v => v.placa));
        const newVehicles = Array.from(uniquePlates).map(placa => {
            return importedVehicles.find(v => v.placa === placa)!;
        });

        setVehicles(newVehicles);
        setNotification({ type: 'success', message: `Importação concluída! ${newVehicles.length} veículos cadastrados com sucesso.` });
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setNotification({ type: 'error', message: 'Erro ao processar o arquivo. Verifique o formato e o conteúdo.' });
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const uniqueVehicleCount = new Set(vehicles.map(v => v.placa)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Base de Veículos</h2>
          <p className="text-gray-500 mt-1">Importe e visualize os veículos da sua frota.</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-center">
                <p className="text-3xl font-bold text-blue-800">{uniqueVehicleCount}</p>
                <p className="text-sm font-medium text-gray-500">Veículos Cadastrados</p>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".xlsx, .xls"
            />
            <button
                onClick={triggerFileInput}
                style={{ backgroundColor: '#004aad' }}
                className="flex items-center gap-2 px-5 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <Upload size={20} />
                Importar Planilha
            </button>
        </div>
      </div>

      {notification && (
        <div id="notification-banner" className={`flex items-center gap-3 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.type === 'success' ? <FileCheck size={20} /> : <AlertTriangle size={20} />}
          <p className="font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-auto text-lg font-bold">&times;</button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Placa</th>
              <th scope="col" className="px-6 py-3">Marca</th>
              <th scope="col" className="px-6 py-3">Modelo</th>
              <th scope="col" className="px-6 py-3">Classificação</th>
              <th scope="col" className="px-6 py-3">Cor</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <tr key={vehicle.placa} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{vehicle.placa}</td>
                  <td className="px-6 py-4">{vehicle.marca}</td>
                  <td className="px-6 py-4">{vehicle.modelo}</td>
                  <td className="px-6 py-4">{vehicle.classificacao}</td>
                  <td className="px-6 py-4">{vehicle.cor}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  Nenhum veículo importado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};