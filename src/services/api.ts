import { supabase } from '@/lib/supabase';

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Usuário não autenticado. Faça login novamente.');
  return session.user.id;
}

function throwError(error: any, context: string): never {
  const msg = error?.message || error?.details || `Erro em ${context}`;
  console.error(`[${context}]`, error);
  throw new Error(msg);
}

// ============================================================
// CLIENTES
// ============================================================
export const clienteService = {
  async listar() {
    const { data, error } = await supabase.from('clientes').select('*').order('nome');
    if (error) throwError(error, 'clienteService.listar');
    return data || [];
  },
  async buscar(id: string) {
    const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
    if (error) throwError(error, 'clienteService.buscar');
    return data;
  },
  async criar(form: { nome: string; telefone: string; email?: string; endereco?: string; observacoes?: string }) {
    const user_id = await getUserId();
    const { data, error } = await supabase.from('clientes').insert({ user_id, nome: form.nome, telefone: form.telefone, email: form.email || null, endereco: form.endereco || null, observacoes: form.observacoes || null }).select().single();
    if (error) throwError(error, 'clienteService.criar');
    return data;
  },
  async atualizar(id: string, form: Record<string, any>) {
    const { data, error } = await supabase.from('clientes').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throwError(error, 'clienteService.atualizar');
    return data;
  },
  async deletar(id: string) {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throwError(error, 'clienteService.deletar');
  },
};

// ============================================================
// MOTOS
// ============================================================
export const motoService = {
  async listar() {
    const { data, error } = await supabase.from('motos').select('*, clientes(nome)').order('created_at', { ascending: false });
    if (error) throwError(error, 'motoService.listar');
    return (data || []).map((m: any) => ({ ...m, clienteNome: m.clientes?.nome || '' }));
  },
  async listarPorCliente(clienteId: string) {
    const { data, error } = await supabase.from('motos').select('*, clientes(nome)').eq('cliente_id', clienteId).order('created_at', { ascending: false });
    if (error) throwError(error, 'motoService.listarPorCliente');
    return (data || []).map((m: any) => ({ ...m, clienteNome: m.clientes?.nome || '' }));
  },
  async criar(form: { cliente_id: string; marca: string; modelo: string; ano?: number; cor?: string; placa?: string; km?: number; observacoes?: string }) {
    const user_id = await getUserId();
    const { data, error } = await supabase.from('motos').insert({ user_id, cliente_id: form.cliente_id, marca: form.marca, modelo: form.modelo, ano: form.ano || null, cor: form.cor || null, placa: form.placa || null, km: form.km || null, observacoes: form.observacoes || null }).select().single();
    if (error) throwError(error, 'motoService.criar');
    return data;
  },
  async atualizar(id: string, form: Record<string, any>) {
    const { data, error } = await supabase.from('motos').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throwError(error, 'motoService.atualizar');
    return data;
  },
  async deletar(id: string) {
    const { error } = await supabase.from('motos').delete().eq('id', id);
    if (error) throwError(error, 'motoService.deletar');
  },
};

// ============================================================
// PEÇAS / ESTOQUE
// ============================================================
export const pecaService = {
  async listar() {
    const { data, error } = await supabase.from('pecas').select('*').order('nome');
    if (error) throwError(error, 'pecaService.listar');
    return (data || []).map((p: any) => ({
      ...p,
      statusEstoque: p.quantidade <= (p.estoque_minimo || 0) * 0.5 ? 'critico' : p.quantidade <= (p.estoque_minimo || 0) ? 'baixo' : 'normal',
    }));
  },
  async criar(form: { nome: string; modelo?: string; compatibilidade?: string; categoria?: string; quantidade: number; preco: number; estoque_minimo?: number }) {
    const user_id = await getUserId();
    const { data, error } = await supabase.from('pecas').insert({ user_id, nome: form.nome, modelo: form.modelo || null, compatibilidade: form.compatibilidade || null, categoria: form.categoria || null, quantidade: form.quantidade, preco: form.preco, estoque_minimo: form.estoque_minimo || 5 }).select().single();
    if (error) throwError(error, 'pecaService.criar');
    return data;
  },
  async atualizar(id: string, form: Record<string, any>) {
    const { data, error } = await supabase.from('pecas').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throwError(error, 'pecaService.atualizar');
    return data;
  },
  async deletar(id: string) {
    const { error } = await supabase.from('pecas').delete().eq('id', id);
    if (error) throwError(error, 'pecaService.deletar');
  },
  async buscarOSVinculadas(pecaId: string) {
    const { data, error } = await supabase
      .from('ordem_itens')
      .select('ordem_id, quantidade, ordens_servico(numero, status, clientes(nome))')
      .eq('peca_id', pecaId);
    if (error) throwError(error, 'pecaService.buscarOSVinculadas');
    return (data || []).map((item: any) => ({
      ordemId: item.ordem_id,
      numero: item.ordens_servico?.numero || '',
      status: item.ordens_servico?.status || '',
      clienteNome: item.ordens_servico?.clientes?.nome || '',
      quantidade: item.quantidade,
    }));
  },
  async deletarForce(id: string) {
    // Remove da ordem_itens primeiro, depois exclui a peça
    const { error: itemErr } = await supabase.from('ordem_itens').delete().eq('peca_id', id);
    if (itemErr) throwError(itemErr, 'pecaService.deletarForce.itens');
    const { error } = await supabase.from('pecas').delete().eq('id', id);
    if (error) throwError(error, 'pecaService.deletarForce');
  },
  async entradaEstoque(pecaId: string, quantidade: number) {
    const { data: peca, error: fetchErr } = await supabase.from('pecas').select('quantidade').eq('id', pecaId).single();
    if (fetchErr) throwError(fetchErr, 'pecaService.entradaEstoque.fetch');
    const { data, error } = await supabase.from('pecas').update({ quantidade: (peca?.quantidade || 0) + quantidade, updated_at: new Date().toISOString() }).eq('id', pecaId).select().single();
    if (error) throwError(error, 'pecaService.entradaEstoque.update');
    return data;
  },
};

// ============================================================
// ORDENS DE SERVIÇO
// ============================================================
export const ordemService = {
  async listar() {
    const { data, error } = await supabase.from('ordens_servico').select('*, clientes(nome), motos(marca, modelo, ano)').order('created_at', { ascending: false });
    if (error) throwError(error, 'ordemService.listar');
    return (data || []).map((o: any) => ({
      ...o, clienteNome: o.clientes?.nome || '',
      motoDescricao: o.motos ? `${o.motos.marca} ${o.motos.modelo} ${o.motos.ano || ''}`.trim() : '',
    }));
  },
  async listarPorMoto(motoId: string) {
    const { data, error } = await supabase.from('ordens_servico').select('*, clientes(nome), motos(marca, modelo, ano)').eq('moto_id', motoId).order('created_at', { ascending: false });
    if (error) throwError(error, 'ordemService.listarPorMoto');
    return (data || []).map((o: any) => ({
      ...o, clienteNome: o.clientes?.nome || '',
      motoDescricao: o.motos ? `${o.motos.marca} ${o.motos.modelo} ${o.motos.ano || ''}`.trim() : '',
    }));
  },
  async listarPorCliente(clienteId: string) {
    const { data, error } = await supabase.from('ordens_servico').select('*, clientes(nome), motos(marca, modelo, ano)').eq('cliente_id', clienteId).order('created_at', { ascending: false });
    if (error) throwError(error, 'ordemService.listarPorCliente');
    return (data || []).map((o: any) => ({
      ...o, clienteNome: o.clientes?.nome || '',
      motoDescricao: o.motos ? `${o.motos.marca} ${o.motos.modelo} ${o.motos.ano || ''}`.trim() : '',
    }));
  },
  async buscar(id: string) {
    const { data, error } = await supabase.from('ordens_servico').select('*, clientes(nome, telefone), motos(marca, modelo, ano, placa), ordem_itens(*, pecas(nome))').eq('id', id).single();
    if (error) throwError(error, 'ordemService.buscar');
    return {
      ...data, clienteNome: (data as any).clientes?.nome || '',
      clienteTelefone: (data as any).clientes?.telefone || '',
      motoDescricao: (data as any).motos ? `${(data as any).motos.marca} ${(data as any).motos.modelo} ${(data as any).motos.ano || ''}`.trim() : '',
      motoPlaca: (data as any).motos?.placa || '',
      itens: ((data as any).ordem_itens || []).map((item: any) => ({ ...item, pecaNome: item.pecas?.nome || '', subtotal: Number(item.preco_unitario || 0) * Number(item.quantidade || 0) })),
    };
  },
  async criar(form: { cliente_id: string; moto_id: string; problema_relatado: string; descricao_servico?: string; itens: { peca_id: string; quantidade: number; preco_unitario: number }[]; valor_mao_obra?: number }) {
    const user_id = await getUserId();

    // Validar estoque disponível antes de qualquer operação
    if (form.itens.length > 0) {
      for (const item of form.itens) {
        const { data: peca } = await supabase.from('pecas').select('nome, quantidade').eq('id', item.peca_id).single();
        if (peca && peca.quantidade < item.quantidade) {
          throw new Error(`Estoque insuficiente para "${peca.nome}": disponível ${peca.quantidade}, solicitado ${item.quantidade}`);
        }
      }
    }

    let numero: string;
    const { data: numData, error: numErr } = await supabase.rpc('gerar_numero_os', { p_user_id: user_id });
    if (numErr) { numero = `OS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`; } else { numero = numData; }
    const valorPecas = form.itens.reduce((t, i) => t + i.preco_unitario * i.quantidade, 0);
    const valorTotal = valorPecas + (form.valor_mao_obra || 0);
    const { data: ordem, error: osErr } = await supabase.from('ordens_servico').insert({ user_id, numero, cliente_id: form.cliente_id, moto_id: form.moto_id, problema_relatado: form.problema_relatado, descricao_servico: form.descricao_servico || '', valor_mao_obra: form.valor_mao_obra || 0, valor_total: valorTotal }).select().single();
    if (osErr) throwError(osErr, 'ordemService.criar.ordem');
    if (form.itens.length > 0 && ordem) {
      const itensData = form.itens.map(i => ({ ordem_id: ordem.id, peca_id: i.peca_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario, subtotal: i.preco_unitario * i.quantidade }));
      await supabase.from('ordem_itens').insert(itensData);
      for (const item of form.itens) {
        try { const { data: peca } = await supabase.from('pecas').select('quantidade').eq('id', item.peca_id).single(); if (peca) await supabase.from('pecas').update({ quantidade: peca.quantidade - item.quantidade, updated_at: new Date().toISOString() }).eq('id', item.peca_id); } catch (e) { console.warn('[estoque] Falha ao descontar quantidade:', e); }
      }
    }
    return ordem;
  },
  async atualizar(id: string, form: Record<string, any>) {
    const { data, error } = await supabase.from('ordens_servico').update({ ...form, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throwError(error, 'ordemService.atualizar');
    return data;
  },
  async atualizarStatus(id: string, status: string) {
    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (status === 'finalizada') updates.finalizado_em = new Date().toISOString();
    const { data, error } = await supabase.from('ordens_servico').update(updates).eq('id', id).select().single();
    if (error) throwError(error, 'ordemService.atualizarStatus');
    return data;
  },
  async atualizarItens(ordemId: string, itens: { peca_id: string; quantidade: number; preco_unitario: number }[], novoTotal: number) {
    // 1. Busca itens atuais para restaurar estoque
    const { data: itensAtuais } = await supabase.from('ordem_itens').select('peca_id, quantidade').eq('ordem_id', ordemId);

    // 2. Restaura estoque dos itens antigos
    for (const old of itensAtuais || []) {
      try {
        const { data: peca } = await supabase.from('pecas').select('quantidade').eq('id', old.peca_id).single();
        if (peca) await supabase.from('pecas').update({ quantidade: peca.quantidade + old.quantidade, updated_at: new Date().toISOString() }).eq('id', old.peca_id);
      } catch (e) { console.warn('[estoque] Falha ao restaurar quantidade:', e); }
    }

    // 3. Remove itens antigos da OS
    const { error: delErr } = await supabase.from('ordem_itens').delete().eq('ordem_id', ordemId);
    if (delErr) throwError(delErr, 'ordemService.atualizarItens.delete');

    // 4. Insere novos itens e desconta estoque
    if (itens.length > 0) {
      const rows = itens.map(i => ({ ordem_id: ordemId, peca_id: i.peca_id, quantidade: i.quantidade, preco_unitario: i.preco_unitario, subtotal: i.preco_unitario * i.quantidade }));
      const { error: insErr } = await supabase.from('ordem_itens').insert(rows);
      if (insErr) throwError(insErr, 'ordemService.atualizarItens.insert');
      for (const item of itens) {
        try {
          const { data: peca } = await supabase.from('pecas').select('quantidade').eq('id', item.peca_id).single();
          if (peca) await supabase.from('pecas').update({ quantidade: Math.max(0, peca.quantidade - item.quantidade), updated_at: new Date().toISOString() }).eq('id', item.peca_id);
        } catch (e) { console.warn('[estoque] Falha ao descontar quantidade:', e); }
      }
    }

    // 5. Atualiza valor_total da OS
    const { error: updErr } = await supabase.from('ordens_servico').update({ valor_total: novoTotal, updated_at: new Date().toISOString() }).eq('id', ordemId);
    if (updErr) throwError(updErr, 'ordemService.atualizarItens.total');
  },
  async deletar(id: string) {
    await supabase.from('ordem_itens').delete().eq('ordem_id', id);
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
    if (error) throwError(error, 'ordemService.deletar');
  },
};

// ============================================================
// DASHBOARD
// ============================================================
export const dashboardService = {
  async obter() {
    const [clientesRes, pecasRes, ordensRes] = await Promise.all([
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
      supabase.from('pecas').select('*'),
      supabase.from('ordens_servico').select('*, clientes(nome), motos(marca, modelo, ano)').order('created_at', { ascending: false }).limit(10),
    ]);
    const pecas = pecasRes.data || [];
    const ordens = (ordensRes.data || []).map((o: any) => ({ ...o, clienteNome: o.clientes?.nome || '', motoDescricao: o.motos ? `${o.motos.marca} ${o.motos.modelo} ${o.motos.ano || ''}`.trim() : '' }));
    const alertas = pecas.filter((p: any) => p.quantidade <= (p.estoque_minimo || 0)).map((p: any) => ({ pecaId: p.id, pecaNome: p.nome, quantidade: p.quantidade, estoqueMinimo: p.estoque_minimo, status: p.quantidade <= (p.estoque_minimo || 0) * 0.5 ? 'critico' as const : 'baixo' as const })).sort((a: any, b: any) => a.quantidade - b.quantidade);
    return {
      totalClientes: clientesRes.count || 0,
      totalItensEstoque: pecas.reduce((t: number, p: any) => t + (p.quantidade || 0), 0),
      totalMotosNaOficina: new Set(ordens.filter((o: any) => o.status === 'aberta' || o.status === 'em_andamento').map((o: any) => o.moto_id)).size,
      itensComEstoqueBaixo: alertas,
      ordensRecentes: ordens,
    };
  },
};

// ============================================================
// CONFIGURAÇÕES
// ============================================================
export const configService = {
  async obter() {
    const user_id = await getUserId();
    const { data } = await supabase.from('configuracoes').select('*').eq('user_id', user_id).maybeSingle();
    if (data) return data;
    const { data: created, error: createErr } = await supabase.from('configuracoes').upsert({ user_id, nome_oficina: 'DM Motos - Peças e Serviços', notificacoes_ativas: true, alerta_estoque_ativo: true, limite_estoque_baixo: 5 }, { onConflict: 'user_id' }).select().single();
    if (createErr) throwError(createErr, 'configService.obter.create');
    return created;
  },
  async atualizar(form: Record<string, any>) {
    const user_id = await getUserId();
    const { data, error } = await supabase.from('configuracoes').upsert({ user_id, ...form, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single();
    if (error) throwError(error, 'configService.atualizar');
    return data;
  },
};

// ============================================================
// HELPERS DE VÍNCULO PARA EXCLUSÃO
// ============================================================
export const vinculoService = {
  async osDeCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id, numero, status')
      .eq('cliente_id', clienteId);
    if (error) throwError(error, 'vinculoService.osDeCliente');
    return data || [];
  },
  async osDeMoto(motoId: string) {
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id, numero, status')
      .eq('moto_id', motoId);
    if (error) throwError(error, 'vinculoService.osDeMoto');
    return data || [];
  },
  async deletarClienteForce(clienteId: string) {
    // 1. Busca todas as OS do cliente
    const { data: ordens } = await supabase.from('ordens_servico').select('id').eq('cliente_id', clienteId);
    // 2. Remove itens de cada OS
    for (const o of ordens || []) {
      await supabase.from('ordem_itens').delete().eq('ordem_id', o.id);
    }
    // 3. Remove as OS
    await supabase.from('ordens_servico').delete().eq('cliente_id', clienteId);
    // 4. Remove motos
    await supabase.from('motos').delete().eq('cliente_id', clienteId);
    // 5. Remove cliente
    const { error } = await supabase.from('clientes').delete().eq('id', clienteId);
    if (error) throwError(error, 'vinculoService.deletarClienteForce');
  },
  async deletarMotoForce(motoId: string) {
    // 1. Busca OS da moto
    const { data: ordens } = await supabase.from('ordens_servico').select('id').eq('moto_id', motoId);
    // 2. Remove itens de cada OS
    for (const o of ordens || []) {
      await supabase.from('ordem_itens').delete().eq('ordem_id', o.id);
    }
    // 3. Remove as OS
    await supabase.from('ordens_servico').delete().eq('moto_id', motoId);
    // 4. Remove moto
    const { error } = await supabase.from('motos').delete().eq('id', motoId);
    if (error) throwError(error, 'vinculoService.deletarMotoForce');
  },
};
