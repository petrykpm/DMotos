-- ============================================================
-- DM MOTOS - Supabase Migration
-- Execute este SQL no Supabase SQL Editor (uma única vez)
-- ============================================================

-- 1. TABELA DE PERFIS (vinculada ao auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'mecanico' check (role in ('admin', 'mecanico', 'atendente')),
  ativo boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CLIENTES
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  telefone text not null,
  email text,
  endereco text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. MOTOS
create table if not exists public.motos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  marca text not null,
  modelo text not null,
  ano integer,
  cor text,
  placa text,
  km integer,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. PEÇAS / ESTOQUE
create table if not exists public.pecas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  modelo text,
  compatibilidade text,
  categoria text,
  sku text,
  quantidade integer not null default 0,
  estoque_minimo integer not null default 5,
  preco numeric(10,2) not null default 0,
  preco_custo numeric(10,2),
  fornecedor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. ORDENS DE SERVIÇO
create table if not exists public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero text not null,
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  moto_id uuid not null references public.motos(id) on delete restrict,
  problema_relatado text not null,
  descricao_servico text,
  status text not null default 'aberta' check (status in ('aberta', 'em_andamento', 'finalizada', 'cancelada')),
  valor_mao_obra numeric(10,2) not null default 0,
  valor_total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalizado_em timestamptz
);

-- 6. ITENS DA ORDEM DE SERVIÇO
create table if not exists public.ordem_itens (
  id uuid primary key default gen_random_uuid(),
  ordem_id uuid not null references public.ordens_servico(id) on delete cascade,
  peca_id uuid not null references public.pecas(id) on delete restrict,
  quantidade integer not null default 1,
  preco_unitario numeric(10,2) not null,
  subtotal numeric(10,2) not null,
  created_at timestamptz not null default now()
);

-- 7. CONFIGURAÇÕES DO SISTEMA
create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nome_oficina text not null default 'Minha Oficina',
  notificacoes_ativas boolean not null default true,
  alerta_estoque_ativo boolean not null default true,
  limite_estoque_baixo integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_clientes_user on public.clientes(user_id);
create index if not exists idx_motos_user on public.motos(user_id);
create index if not exists idx_motos_cliente on public.motos(cliente_id);
create index if not exists idx_pecas_user on public.pecas(user_id);
create index if not exists idx_ordens_user on public.ordens_servico(user_id);
create index if not exists idx_ordens_cliente on public.ordens_servico(cliente_id);
create index if not exists idx_ordens_status on public.ordens_servico(status);
create index if not exists idx_ordem_itens_ordem on public.ordem_itens(ordem_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.clientes enable row level security;
alter table public.motos enable row level security;
alter table public.pecas enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.ordem_itens enable row level security;
alter table public.configuracoes enable row level security;

-- Profiles: usuário só vê/edita o próprio perfil
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Clientes: usuário só vê/edita os próprios clientes
create policy "clientes_select_own" on public.clientes for select using (auth.uid() = user_id);
create policy "clientes_insert_own" on public.clientes for insert with check (auth.uid() = user_id);
create policy "clientes_update_own" on public.clientes for update using (auth.uid() = user_id);
create policy "clientes_delete_own" on public.clientes for delete using (auth.uid() = user_id);

-- Motos
create policy "motos_select_own" on public.motos for select using (auth.uid() = user_id);
create policy "motos_insert_own" on public.motos for insert with check (auth.uid() = user_id);
create policy "motos_update_own" on public.motos for update using (auth.uid() = user_id);
create policy "motos_delete_own" on public.motos for delete using (auth.uid() = user_id);

-- Peças
create policy "pecas_select_own" on public.pecas for select using (auth.uid() = user_id);
create policy "pecas_insert_own" on public.pecas for insert with check (auth.uid() = user_id);
create policy "pecas_update_own" on public.pecas for update using (auth.uid() = user_id);
create policy "pecas_delete_own" on public.pecas for delete using (auth.uid() = user_id);

-- Ordens de Serviço
create policy "ordens_select_own" on public.ordens_servico for select using (auth.uid() = user_id);
create policy "ordens_insert_own" on public.ordens_servico for insert with check (auth.uid() = user_id);
create policy "ordens_update_own" on public.ordens_servico for update using (auth.uid() = user_id);

-- Ordem Itens: acesso via ordem do próprio usuário
create policy "ordem_itens_select" on public.ordem_itens for select
  using (exists (select 1 from public.ordens_servico os where os.id = ordem_id and os.user_id = auth.uid()));
create policy "ordem_itens_insert" on public.ordem_itens for insert
  with check (exists (select 1 from public.ordens_servico os where os.id = ordem_id and os.user_id = auth.uid()));
create policy "ordem_itens_delete" on public.ordem_itens for delete
  using (exists (select 1 from public.ordens_servico os where os.id = ordem_id and os.user_id = auth.uid()));

-- Configurações
create policy "config_select_own" on public.configuracoes for select using (auth.uid() = user_id);
create policy "config_insert_own" on public.configuracoes for insert with check (auth.uid() = user_id);
create policy "config_update_own" on public.configuracoes for update using (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Criar perfil automaticamente ao registrar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  
  insert into public.configuracoes (user_id, nome_oficina)
  values (new.id, 'Minha Oficina');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- FUNCTION: Gerar número sequencial da OS
-- ============================================================
create or replace function public.gerar_numero_os(p_user_id uuid)
returns text as $$
declare
  v_count integer;
  v_year text;
begin
  v_year := to_char(now(), 'YYYY');
  select count(*) + 1 into v_count
  from public.ordens_servico
  where user_id = p_user_id
    and extract(year from created_at) = extract(year from now());
  return 'OS-' || v_year || '-' || lpad(v_count::text, 3, '0');
end;
$$ language plpgsql security definer;

-- ============================================================
-- FUNCTION: Computed status de estoque
-- ============================================================
create or replace function public.status_estoque(p_quantidade integer, p_estoque_minimo integer)
returns text as $$
begin
  if p_quantidade <= p_estoque_minimo * 0.5 then return 'critico';
  elsif p_quantidade <= p_estoque_minimo then return 'baixo';
  else return 'normal';
  end if;
end;
$$ language plpgsql immutable;

-- ============================================================
-- Notify PostgREST to reload schema cache
-- ============================================================
notify pgrst, 'reload schema';
