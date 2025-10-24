export interface Vehicle {
  placa: string;
  marca: string;
  modelo: string;
  classificacao: string;
  cor: string;
}

export interface Claim extends Vehicle {
  id: string;
  dataExecucao: string;
  motorista: string;
  responsavel: string;
  culpabilidade: 'Sim' | 'Não';
  valor: number;
  observacoes: string;
}