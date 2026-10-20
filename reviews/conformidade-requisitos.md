# Revisão de conformidade com o PRD

## Escopo coberto
- [x] Tela inicial com nome, botão, explicação curta e tema do dia.
- [x] Tabuleiro de cinco letras com seis tentativas.
- [x] Feedback por letra: verde, amarelo e cinza.
- [x] Validação de tamanho, lista de palavras e repetição.
- [x] Resultado e revelação da resposta somente ao concluir.
- [x] Estatísticas de partidas, vitórias, percentual, streak atual e melhor streak.
- [x] Compartilhamento/cópia sem incluir a solução.
- [x] Layout responsivo mobile-first.
- [x] Teclado físico e teclado virtual.
- [x] Sem cadastro e sem monetização.

## Conformidade parcial / riscos
- Persistência é via `localStorage`, portanto só funciona no navegador/dispositivo atual e pode ser apagada.
- Sem backend, a regra de uma palavra por dia pode ser contornada limpando o armazenamento ou alterando a data do dispositivo.
- O banco de palavras é pequeno e necessita revisão editorial e expansão; alguns exemplos de validação são apenas uma lista inicial.
- A seleção usa ciclo de puzzles, então a variedade se repete após 16 dias.

## Resultado
O protótipo cobre o fluxo principal do MVP descrito no PRD, com as limitações de uma implementação sem servidor. Recomenda-se ampliar e revisar o dicionário antes de uso público.
