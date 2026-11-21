# Cruzadinha de Arquitetura Computacional

Jogo de cruzadinha interativo desenvolvido em HTML, CSS e JavaScript puros para fixação dos conceitos de Tópicos de Arquitetura Computacional.

## Como jogar

1. Leia as pistas numeradas de **1 a 16** nas listas **Horizontais** e **Verticais** (ou clique em qualquer pergunta para destacá-la no tabuleiro).
2. Digite as letras diretamente nas casas (sem acento e sem espaço). Use `Tab` para saltar entre perguntas pendentes, as setas para navegar e `Espaço` para alternar a direção.
3. Pressione `Enter` ou clique em **Validar esta palavra** (ou no ícone `✓` ao lado da pista) para verificar uma pergunta por vez, ou clique em **Conferir Tudo** para validar o tabuleiro inteiro.
4. Use o botão **Dica** para revelar uma letra da palavra selecionada.
5. Clique em **Reiniciar** para limpar o tabuleiro e iniciar uma nova partida.

## Palavras e pistas

| Nº | Direção | Pista | Resposta |
|----|---------|-------|----------|
| 1 | Vertical | Memória persistente regravável byte a byte via pulsos elétricos sem remoção do circuito. | EEPROM |
| 2 | Horizontal | Armazenamento principal volátil de leitura e escrita que perde dados ao desligar. | RAM |
| 3 | Vertical | Células internas ao núcleo com latência de um ciclo para operandos imediatos. | REGISTRADORES |
| 4 | Vertical | Decodifica instruções binárias e dispara sinais elétricos que coordenam todo o datapath. | UC |
| 5 | Vertical | Pastilha monolítica que integra quatro motores independentes de execução paralela em hardware. | QUADCORE |
| 6 | Horizontal | Orquestra o ciclo contínuo de busca, decodificação e execução das instruções de máquina. | CPU |
| 7 | Vertical | Trilhas unidirecionais cuja largura em bits limita o total de locais acessíveis. | ADDRESSBUS |
| 8 | Vertical | Armazenamento secundário não volátil de alta capacidade e latência elevada, como SSD. | MEMORIADEMASSA |
| 9 | Vertical | Transfere blocos entre periféricos e memória principal sem intervenção contínua do processador. | DMA |
| 10 | Horizontal | Chip embarcado completo que integra núcleo, memórias internas e pinos periféricos programáveis. | MICROCONTROLADOR |
| 11 | Vertical | Hierarquia SRAM ultrarrápida em níveis que explora localidade temporal e espacial. | CACHE |
| 12 | Vertical | Via bidirecional paralela que transporta palavras binárias lidas ou escritas entre componentes. | DATABUS |
| 13 | Horizontal | Tecnologia persistente apagada por blocos inteiros, base de pendrives e firmwares modernos. | FLASH |
| 14 | Horizontal | Bloco combinacional que executa operações matemáticas, deslocamentos binários e atualiza flags de estado. | ULA |
| 15 | Horizontal | Arquitetura com dois motores físicos independentes capazes de processar duas threads simultaneamente. | DUALCORE |
| 16 | Vertical | Conteúdo gravado por máscara na fabricação, imutável em operação normal para boot. | ROM |



## Site publicado

https://joaovitorrpinheiro.github.io/Jogo-de-Arquitetura-Computacional/

## Atalhos de teclado

| Tecla | Ação |
|-------|------|
| `Setas` | Move o cursor entre as casas |
| `Espaço` | Alterna entre Horizontal e Vertical |
| `Tab` | Pula para a próxima pergunta pendente |
| `Enter` | Valida a pergunta selecionada |
| `Backspace` / `Delete` | Apaga a letra da casa atual |