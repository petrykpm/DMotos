-- Tabela de categorias customizáveis de peças
CREATE TABLE IF NOT EXISTS categorias_peca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE categorias_peca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas categorias"
  ON categorias_peca FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria suas categorias"
  ON categorias_peca FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário edita suas categorias"
  ON categorias_peca FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta suas categorias"
  ON categorias_peca FOR DELETE
  USING (auth.uid() = user_id);

-- Inserir categorias padrão para usuários existentes
-- (rode isso após criar a tabela se quiser popular com as categorias fixas atuais)
