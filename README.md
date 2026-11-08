# Studio Carla Sanny - Agendamento Online & Painel Administrativo 🌸✨

Interface web moderna, responsiva (*mobile-first*) e elegante com estética Apple / Rosa desenvolvida para o **Studio Carla Sanny** (Podologia, Manicure & Pedicure, Design de Sobrancelhas e Depilação).

## 🚀 Funcionalidades

### 📱 Para as Clientes (Mobile-First):
- **Fluxo Linear e Centralizado:** Desenvolvido especialmente para facilidade de uso por idosos e clientes de todas as idades, sem rolagem excessiva.
- **Múltipla Seleção:** Selecione um ou mais serviços de diferentes categorias.
- **Cálculo Automático de Horas:** O sistema calcula a duração total somada e o valor final em tempo real.
- **Prevenção de Conflitos e Sobreposições:** Bloqueia automaticamente horários que colidem com atendimentos existentes pela duração do serviço.
- **Calendário Mensal Interativo:** Escolha visual da data e seleção dos horários disponíveis (manhã e tarde).
- **Confirmação Direta no WhatsApp:** Gera comprovante no estilo Apple Wallet e abre o WhatsApp com os dados prontos para envio.

### 👩‍💼 Para a Carla (Painel Admin `/cbarbosa`):
- **Visão Geral Mensal:** Calendário com contadores de agendamento por dia.
- **Configuração do WhatsApp Oficial:** Troca fácil do número comercial onde caem as mensagens.
- **Gestão de Clientes:** Botão para chamar a cliente direto no WhatsApp, marcar como atendido e excluir.
- **Agendamento Manual:** Adicionar clientes que ligaram por fora mantendo a agenda centralizada.

---

## 🛠️ Tecnologias Utilizadas
- **React 19** + **Vite**
- **Tailwind CSS v4**
- **React Router Dom**
- **Lucide React** & **Canvas Confetti**

---

## 💻 Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor local
npm run dev

# Build de produção
npm run build
```

---

## ☁️ Deploy no Netlify
O projeto já conta com `netlify.toml` e `public/_redirects` pré-configurados para o roteamento SPA (`/cbarbosa`).
Basta conectar este repositório no Netlify ou subir via Netlify CLI!
