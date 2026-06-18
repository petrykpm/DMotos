// ============================
// Entidades do sistema DM Motos
// ============================

export interface Profile {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'mecanico' | 'atendente';
  ativo: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Moto {
  id: string;
  user_id: string;
  cliente_id: string;
  clienteNome?: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  placa?: string;
  km?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Peca {
  id: string;
  user_id: string;
  nome: string;
  modelo?: string;
  compatibilidade?: string;
  categoria?: string;
  sku?: string;
  quantidade: number;
  estoque_minimo: number;
  preco: number;
  preco_custo?: number;
  fornecedor?: string;
  statusEstoque?: 'normal' | 'baixo' | 'critico';
  created_at: string;
  updated_at: string;
}

export type StatusOS = 'aberta' | 'em_andamento' | 'finalizada' | 'cancelada';

export interface ItemOrdemServico {
  id: string;
  ordem_id: string;
  peca_id: string;
  pecaNome?: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

export interface OrdemServico {
  id: string;
  user_id: string;
  numero: string;
  cliente_id: string;
  clienteNome?: string;
  moto_id: string;
  motoDescricao?: string;
  problema_relatado: string;
  descricao_servico?: string;
  status: StatusOS;
  itens?: ItemOrdemServico[];
  valor_mao_obra: number;
  valor_total: number;
  created_at: string;
  updated_at: string;
  finalizado_em?: string;
}

export interface AlertaEstoque {
  pecaId: string;
  pecaNome: string;
  quantidade: number;
  estoqueMinimo: number;
  status: 'baixo' | 'critico';
}

export interface DashboardHome {
  totalClientes: number;
  totalItensEstoque: number;
  totalMotosNaOficina: number;
  itensComEstoqueBaixo: AlertaEstoque[];
  ordensRecentes: OrdemServico[];
}

export interface ConfiguracaoSistema {
  id: string;
  user_id: string;
  nome_oficina: string;
  notificacoes_ativas: boolean;
  alerta_estoque_ativo: boolean;
  limite_estoque_baixo: number;
}

// Form types
export interface LoginForm {
  email: string;
  senha: string;
}

export interface ClienteForm {
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
}

export interface MotoForm {
  cliente_id: string;
  marca: string;
  modelo: string;
  ano?: number;
  cor?: string;
  placa?: string;
  km?: number;
}

export interface PecaEntradaForm {
  nome: string;
  modelo?: string;
  compatibilidade?: string;
  categoria?: string;
  quantidade: number;
  preco: number;
}

export interface OrdemServicoForm {
  cliente_id: string;
  moto_id: string;
  problema_relatado: string;
  descricao_servico?: string;
  itens: { peca_id: string; quantidade: number; preco_unitario: number }[];
  valor_mao_obra?: number;
}
