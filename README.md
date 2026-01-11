# 🎤 ArticulaIA

> Sistema de fonoaudiologia com IA para treinar pronúncia de crianças

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/yourusername/articula-ia)

## 📖 Sobre o Projeto

**ArticulaIA** é uma plataforma educacional que utiliza Inteligência Artificial (Google Gemini) para ajudar crianças a melhorarem sua pronúncia de forma lúdica e gamificada.

### 🎯 Problema que Resolve

- Fonoaudiologia é cara e inacessível para muitas famílias
- Crianças precisam de prática constante entre as sessões com profissionais
- Falta de ferramentas interativas e motivadoras para treino em casa

### ✨ Funcionalidades Principais

- 🎙️ **Tutor IA**: Gera frases/palavras adequadas à idade e avalia pronúncia
- 📊 **Feedback Inteligente**: Análise com pontuação (0-100) e dicas personalizadas
- 🎮 **Gamificação**: Sistema de XP para motivar exercícios diários
- 💬 **Chat da Turma**: Comunicação entre alunos (estilo WhatsApp)
- 🌓 **Modo Claro/Escuro**: Interface acessível
- 📱 **Mobile-First**: Responsivo para smartphones

## 🚀 Como Usar

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Chave API do Google Gemini ([obter aqui](https://aistudio.google.com/app/apikey))
- Microfone (para gravação de voz)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/yourusername/articula-ia.git
cd articula-ia
```

2. Abra o arquivo `index.html` no navegador:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

3. Cadastre um aluno:
   - Clique em "Novo"
   - Preencha os dados
   - Cole sua chave API do Gemini

4. Comece a treinar!

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilização**: TailwindCSS (via CDN)
- **Backend**: Firebase (Firestore + Auth)
- **IA**: Google Gemini API
  - TTS: `gemini-2.5-flash-preview-tts`
  - Análise: `gemini-2.5-flash-preview-09-2025`
- **Ícones**: Lucide Icons

## 📁 Estrutura do Projeto

```
articula-ia/
├── index.html      # Interface principal
├── app.js          # Lógica JavaScript
├── README.md       # Este arquivo
├── CONTEXT.md      # Documentação técnica
├── LICENSE         # Licença MIT
└── .gitignore      # Arquivos ignorados
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

### Como Contribuir

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

## ⚠️ Disclaimer

**Este sistema não substitui acompanhamento profissional.** Sempre consulte um fonoaudiólogo licenciado para diagnóstico e tratamento adequados.

## 📞 Contato

- **Criador**: [Seu Nome]
- **Email**: seuemail@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

## 🙏 Agradecimentos

- Google Gemini pela API de IA
- Firebase pela infraestrutura
- TailwindCSS pelo design system
- Lucide Icons pelos ícones

---

**Feito com ❤️ para democratizar o acesso à fonoaudiologia**
