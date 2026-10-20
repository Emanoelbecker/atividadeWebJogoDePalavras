# Revisão de código

## Pontos verificados
- Separação entre estrutura (`index.html`), apresentação (`styles.css`) e lógica (`app.js`).
- Tratamento de erros básicos ao ler/gravar `localStorage`.
- Feedback por letra avaliado em duas passagens para lidar com letras repetidas.
- Limite de seis tentativas e rejeição de palavras repetidas.
- Uso de `textContent` para conteúdo dinâmico de texto.
- Estados de interface com `role=status`, rótulos de navegação e foco visível.
- Compartilhamento usa Web Share quando disponível e cópia como alternativa.

## Pontos a corrigir antes de produção
- Ampliar e validar a lista de palavras de resposta e de tentativas com dicionário editorial confiável.
- Adicionar testes automatizados para avaliação de letras duplicadas, sequência diária, reinício por data e armazenamento corrompido.
- A seleção de palavra por data local não é inviolável; um produto competitivo deveria usar data UTC/servidor ou mecanismo consistente documentado.
- Rever a regra de streak: atualmente ela aumenta em vitórias consecutivas, e zera em derrota. Confirmar se o produto deseja sequência de dias jogados ou de vitórias.
- Fazer testes manuais em Safari iOS, Chrome Android, Firefox e leitores de tela.
- As palavras da lista inicial devem ser auditadas para evitar entradas pouco naturais ou que não tenham cinco letras.

## Resultado
A base é simples e legível para um MVP sem dependências, mas ainda requer revisão do vocabulário e testes cross-browser antes de publicação.
