# Wumpus World!

*Trabalho de IA 2019*

O trabalho proposto em aula consiste na construção de uma agente inteligente capaz de se mover pelo tabuleiro, encontrar o Ouro e evitando cair em um poço ou se deparar com o monstro. 

#### Configurações gerais:

- Tabuleiro 8x8
- Um agente
- Um Wumpus
- Uma pilha de ouro
- Três poços

O agente inicia na posição (0,0) e pode se deslocar pelo tabuleiro (restrito a movimentos laterais e verticais apenas), os demais itens são posicionados pelo usuário e mantêm posição fixa.

#### Sensor do Ambiente
- Posição com Wumpus - nas casas adjacentes (não diagonais) o agente sentirá um mau cheiro (odor).
- Posição com Poço - nas casas adjacentes (não diagonais) o agente sentirá uma brisa.
