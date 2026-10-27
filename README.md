# Palavre — desafio diário de palavras

Jogo web responsivo de adivinhação de palavras em português, criado para o MVP descrito no PRD.

## Como executar
1. Extraia o arquivo ZIP.
2. Abra `index.html` em um navegador moderno. Para melhor compatibilidade com compartilhamento, rode um servidor local simples:
   - Python: `python -m http.server 8000`
   - Acesse `http://localhost:8000`.
3. Não há dependências para instalar nem cadastro.

## Testes
Com Node.js instalado, execute `node --test tests\app.test.js`.

## Funcionalidades
- Palavra do dia determinada pela data local e categoria temática.
- Tabuleiro de até seis tentativas, com teclado físico e virtual.
- Feedback verde/amarelo/cinza, incluindo tratamento de letras repetidas.
- Validação de palavras e bloqueio de tentativas repetidas.
- Resultado final, estatísticas básicas e sequência diária.
- Compartilhamento/cópia sem revelar a solução.
- Persistência via `localStorage`.
- Interface mobile-first, foco visível e suporte a `prefers-reduced-motion`.

## Estrutura
- `index.html`: estrutura e diálogos.
- `styles.css`: interface responsiva e estilos.
- `app.js`: lógica de jogo, estado local, estatísticas e compartilhamento.
- `AGENTS.md`: instruções para agentes.
- `docs/plans/2026-10-20-jogo-diario-de-palavras.md`: PRD do projeto.

## Limitações conhecidas do MVP
- O histórico é local ao navegador/dispositivo; não existe conta nem sincronização.
- A lista de palavras válidas é pequena e precisa ser ampliada e revisada editorialmente antes de publicar.
- A seleção diária usa a data local do dispositivo; sem servidor, a data pode ser alterada pelo usuário.
- A palavra é comum a todos os jogadores com base no mesmo dia local, mas a lista de puzzles é cíclica.
