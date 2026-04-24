import Layout from '../../components/Layout'
import styles from './Conteudo.module.css'

export default function Conteudo() {
  return (
    <Layout>
      <div className={styles.pagina}>
        <article className={styles.artigo}>

          <h1 className={styles.tituloPrincipal}>Conteúdo Teórico</h1>

          <section className={styles.secao}>
            <h2>Autômatos Finitos Determinísticos (AFD)</h2>
            <p>
              Um Autômato Finito Determinístico é uma quádrupla (Q, Σ, δ, q₀, F), onde Q é um
              conjunto finito de estados, Σ é o alfabeto de entrada, δ: Q × Σ → Q é a função de
              transição, q₀ ∈ Q é o estado inicial e F ⊆ Q é o conjunto de estados de aceitação.
            </p>
            <p>
              Para cada símbolo lido, o autômato faz exatamente uma transição determinística. Uma
              cadeia é aceita se, após processar todos os seus símbolos, o autômato se encontrar em
              um estado de aceitação.
            </p>
          </section>

          <section className={styles.secao}>
            <h2>Autômatos Finitos Não Determinísticos (AFND)</h2>
            <p>
              No AFND, a função de transição δ: Q × (Σ ∪ {"{ε}"}) → P(Q) pode retornar um conjunto
              de estados, permitindo múltiplos caminhos simultâneos e transições vazias (ε-transições).
            </p>
            <p>
              Uma cadeia é aceita se existe pelo menos um caminho de computação que leva a um estado
              de aceitação. Todo AFD é um caso especial de AFND, e todo AFND pode ser convertido em
              um AFD equivalente (construção de subconjuntos).
            </p>
          </section>

          <section className={styles.secao}>
            <h2>Autômatos de Pilha (AP)</h2>
            <p>
              Os Autômatos de Pilha estendem os autômatos finitos com uma pilha de memória auxiliar
              de capacidade ilimitada. A tupla formal é (Q, Σ, Γ, δ, q₀, Z₀, F), onde Γ é o
              alfabeto da pilha e Z₀ é o símbolo inicial da pilha.
            </p>
            <p>
              A função de transição lê um símbolo da entrada, um símbolo do topo da pilha e decide
              o próximo estado junto com a sequência de símbolos a empilhar. Autômatos de pilha
              reconhecem exatamente as linguagens livres de contexto.
            </p>
            <p>
              A versão não determinística (APND) é estritamente mais poderosa que a determinística
              (APD) — existem linguagens livres de contexto que não podem ser reconhecidas por APDs.
            </p>
          </section>

          <section className={styles.secao}>
            <h2>Máquinas de Turing (MT)</h2>
            <p>
              A Máquina de Turing é definida pela tupla (Q, Σ, Γ, δ, q₀, q<sub>accept</sub>,
              q<sub>reject</sub>), onde Γ ⊇ Σ é o alfabeto da fita (incluindo o símbolo branco ␣)
              e δ: Q × Γ → Q × Γ × {"{L, R}"} é a função de transição.
            </p>
            <p>
              Em cada passo, a MT lê o símbolo sob o cabeçote, escreve um novo símbolo, move o
              cabeçote para a esquerda (L) ou direita (R) e transita para um novo estado. Nesta
              ferramenta, a MT implementada é determinística, de fita única e com lado esquerdo
              limitado (o cabeçote não pode ultrapassar a posição inicial).
            </p>
            <p>
              A MT reconhece exatamente as linguagens recursivamente enumeráveis, sendo o modelo
              computacional mais geral dentre os estudados aqui.
            </p>
          </section>

          <section className={styles.secao}>
            <h2>Manual de Uso</h2>

            <h3>Como usar o Simulador de AFD / AFND</h3>
            <ol>
              <li>Acesse o simulador pelo menu <strong>Simuladores</strong>.</li>
              <li>Clique em <strong>+</strong> para abrir o painel lateral.</li>
              <li>Selecione o tipo de elemento: <em>Início</em>, <em>Estado</em> ou <em>Estado final</em>.</li>
              <li>Clique na área de canvas para posicionar o elemento.</li>
              <li>Para criar transições, clique em um estado de origem e depois em um de destino, informando o símbolo.</li>
              <li>Digite a cadeia a testar no campo <strong>Teste</strong> e veja o resultado em <strong>Resultado</strong>.</li>
            </ol>

            <h3>Como usar o Simulador de APD / APND</h3>
            <ol>
              <li>O processo de construção é igual ao do AFD/AFND.</li>
              <li>Ao criar uma transição, informe também o símbolo lido da pilha e os símbolos a empilhar.</li>
              <li>Durante a simulação, o estado da pilha é exibido em tempo real no painel lateral esquerdo.</li>
            </ol>

            <h3>Como usar o Simulador de Máquina de Turing</h3>
            <ol>
              <li>Adicione estados e transições como nos demais simuladores.</li>
              <li>Cada transição exige: símbolo lido, símbolo escrito e direção do cabeçote (L ou R).</li>
              <li>A fita é exibida na parte inferior da tela com o cabeçote destacado.</li>
              <li>Use os controles de passo a passo ou execução completa para acompanhar a simulação.</li>
            </ol>
          </section>

        </article>
      </div>
    </Layout>
  )
}
