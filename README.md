## 🚀 Stack Técnica

### Linguagens

- TypeScript (principal)
- JavaScript (runtime)
- HTML (via JSX)
- CSS (via TailwindCSS)

### Tecnologias e Ferramentas

- React (componentização e SPA)
- Vite (build e ambiente de desenvolvimento)
- TailwindCSS (estilização utility-first)
- shadcn/ui (design system)
- React Router DOM (roteamento)
- React Query (gerenciamento de estado assíncrono)
- React Hook Form (formulários)
- Zod (validação de dados)

---

## ⚙️ Funcionalidades

### Gestão de Serviços
- Registro de serviços da oficina
- Visualização estruturada das informações
- Interface organizada para acompanhamento operacional

### Interface e Experiência
- Layout responsivo
- Navegação otimizada
- Componentes reutilizáveis
- Feedback visual (loading, estados vazios)

### Estrutura Técnica
- Base preparada para integração com API
- Separação entre UI, lógica e dados
- Arquitetura escalável

---

## 🧱 Arquitetura

Organização modular baseada em boas práticas de front-end moderno:


src/
├── components/ # Componentes reutilizáveis e UI
│ ├── ui/ # Design system (shadcn)
│ └── shared/ # Componentes compartilhados
├── assets/ # Recursos estáticos
├── App.tsx # Configuração principal e rotas
├── main.tsx # Entry point
└── index.css # Estilos globais


---

## 📦 Instalação

```bash
git clone https://github.com/petrykpm/dm-moto-pros.git
cd dm-moto-pros
npm install
🛠️ Execução
npm run dev
📦 Build
npm run build
npm run preview
☁️ Deploy

Deploy contínuo via Vercel:

Push no repositório → build automático
Branch principal → produção
Outras branches → ambientes de preview
🔧 Configuração de Rotas (SPA)

Para evitar erro 404 em rotas internas no deploy:

{
  "routes": [
    { "src": "/(.*)", "dest": "/" }
  ]
}
📊 Status do Projeto
Front-end funcional
Estrutura pronta para backend
Sem persistência de dados (atualmente)
📈 Roadmap
Integração com API REST
Banco de dados (PostgreSQL / Oracle)
Autenticação de usuários
Controle de permissões
Dashboard com métricas
Relatórios operacionais
📐 Padrões e Boas Práticas
Componentização desacoplada
Tipagem estática com TypeScript
Separação de responsabilidades
Estilização consistente com TailwindCSS
Validação estruturada com Zod
⚠️ Observações Técnicas
Projeto estruturado para evolução incremental
Pode ser adaptado para ambiente corporativo
Ideal como base para sistema de gestão completo
