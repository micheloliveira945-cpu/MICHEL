
import React, { useEffect, useRef } from 'react';
import type { Claim } from '../types';
import { Info } from 'lucide-react';

// Declaração global para Chart.js para evitar erros de TypeScript
declare const Chart: any;

interface DashboardTabProps {
  claims: Claim[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ claims }) => {
  const culpabilityChartRef = useRef<HTMLCanvasElement>(null);
  const valueChartRef = useRef<HTMLCanvasElement>(null);
  const culpabilityChartInstance = useRef<any>(null);
  const valueChartInstance = useRef<any>(null);

  useEffect(() => {
    // Destrói instâncias de gráfico existentes antes de criar novas para evitar vazamentos de memória e erros
    if (culpabilityChartInstance.current) {
      culpabilityChartInstance.current.destroy();
    }
    if (valueChartInstance.current) {
      valueChartInstance.current.destroy();
    }

    if (claims.length === 0) {
      return; // Não renderiza gráficos se não houver dados
    }

    // Dados para o Gráfico de Culpabilidade
    const culpabilitySim = claims.filter(c => c.culpabilidade === 'Sim').length;
    const culpabilityNao = claims.filter(c => c.culpabilidade === 'Não').length;

    const culpabilityData = {
      labels: ['Culpabilidade: Não', 'Culpabilidade: Sim'],
      datasets: [
        {
          data: [culpabilityNao, culpabilitySim],
          backgroundColor: ['#36A2EB', '#FF6384'], // Azul para 'Não', Vermelho para 'Sim'
          hoverOffset: 4,
        },
      ],
    };

    // Renderiza o Gráfico de Culpabilidade (Donut Chart)
    if (culpabilityChartRef.current) {
      culpabilityChartInstance.current = new Chart(culpabilityChartRef.current, {
        type: 'doughnut',
        data: culpabilityData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 14,
                },
                color: '#4A5568',
              },
            },
            title: {
              display: true,
              text: 'Distribuição de Culpabilidade',
              font: {
                size: 18,
                weight: 'bold',
              },
              color: '#2D3748',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        if (label) {
                            let sum = 0;
                            const dataArr = context.chart.data.datasets[0].data;
                            sum = dataArr.reduce((a: number, b: number) => a + b, 0);
                            const percentage = (context.parsed * 100 / sum).toFixed(2) + '%';
                            return label + ': ' + context.parsed + ` (${percentage})`;
                        }
                        return '';
                    }
                }
            }
          },
        },
      });
    }

    // Dados para o Gráfico de Valores por Culpabilidade
    const valorSim = claims
      .filter(c => c.culpabilidade === 'Sim')
      .reduce((sum, c) => sum + c.valor, 0);
    const valorNao = claims
      .filter(c => c.culpabilidade === 'Não')
      .reduce((sum, c) => sum + c.valor, 0);

    const valueData = {
      labels: ['Culpabilidade: Não', 'Culpabilidade: Sim'],
      datasets: [
        {
          label: 'Valor Total (R$)',
          data: [valorNao, valorSim],
          backgroundColor: ['#36A2EB', '#FF6384'], // Mesmas cores para consistência
          borderColor: ['#36A2EB', '#FF6384'],
          borderWidth: 1,
        },
      ],
    };

    // Renderiza o Gráfico de Valores (Bar Chart)
    if (valueChartRef.current) {
      valueChartInstance.current = new Chart(valueChartRef.current, {
        type: 'bar',
        data: valueData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false, // A legenda do dataset já está na barra, não precisa duplicar
            },
            title: {
              display: true,
              text: 'Valor Total por Culpabilidade',
              font: {
                size: 18,
                weight: 'bold',
              },
              color: '#2D3748',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        return label + 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Valor (R$)',
                color: '#4A5568',
              },
              ticks: {
                callback: function(value: any, index: any, values: any) {
                    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                },
                color: '#4A5568',
              }
            },
            x: {
                ticks: {
                    color: '#4A5568',
                }
            }
          },
        },
      });
    }
  }, [claims]); // Refaz os gráficos sempre que a lista de sinistros muda

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
        <Info size={48} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhum dado de sinistro disponível</h2>
        <p className="text-center">
          Cadastre novos sinistros na aba "Cadastro" para visualizar os gráficos aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Dashboard de Sinistros</h2>
        <p className="text-gray-500">
          Visualize insights sobre a culpabilidade e os valores dos sinistros registrados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-96 flex justify-center items-center">
          <canvas ref={culpabilityChartRef}></canvas>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-96 flex justify-center items-center">
          <canvas ref={valueChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};