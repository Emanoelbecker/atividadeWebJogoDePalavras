# PRD — Jogo Diário de Palavras

## Objetivo
Implementar um jogo casual diário de adivinhação de palavras em português, responsivo e sem cadastro ou monetização.

## Experiência principal
- Uma palavra de cinco letras por dia, compartilhada por todos os visitantes na mesma data local.
- Tema diário priorizando animais, comida, ciência e esportes.
- Até seis tentativas; feedback verde para letra e posição corretas, amarelo para letra existente em outra posição e cinza para letra ausente.
- Validar tentativas e impedir repetição.
- Mostrar o resultado e a resposta apenas quando a partida terminar.
- Salvar progresso, estatísticas e sequência diária no armazenamento local do navegador.
- Permitir copiar/compartilhar um resumo que não revela a palavra.

## Requisitos não funcionais
- Mobile-first, legível, com contraste adequado, foco visível e botões grandes.
- Funcionar em navegadores modernos sem servidor, dependências ou conta.
- Persistência local; os dados não são sincronizados entre dispositivos.

## Fora do MVP
Ranking global, multiplayer, monetização, contas e sistema avançado de recompensas.

## Critérios de aceite
- A partida aceita teclado físico e teclado virtual na interface.
- Tentativas inválidas não consomem jogadas.
- Cada partida tem no máximo seis tentativas.
- A resposta só é exibida ao vencer ou perder.
- Estatísticas e sequência são atualizadas e persistidas.
- O compartilhamento não contém a solução.
