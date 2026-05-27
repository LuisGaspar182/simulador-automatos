import { validarEntrada } from '../../automata/apnd'
import styles from './ControlesSimulacaoAPND.module.css'

// Exibe no máximo este número de ramos lado a lado
const MAX_RAMOS_VISIVEIS = 4

export default function ControlesSimulacaoAPND({
  apnd,
  entrada,
  setEntrada,
  passos,
  passoAtual,
  ramosAtivos,
  resultado,
  iniciar,
  proximo,
  anterior,
  reset,
  play,
  pause,
  tocando,
}) {
  const simulando = passoAtual >= 0
  const terminado = simulando && passoAtual === passos.length - 1
  const simboloInvalido = apnd.alfabeto.length > 0 ? validarEntrada(apnd, entrada) : null

  const passoInfo = passos[passoAtual] ?? null
  const posAtual = passoInfo?.posicao ?? 0
  const simboloAtualIdx = passoAtual > 0 ? posAtual - 1 : -1

  function classChar(idx) {
    if (idx === simboloAtualIdx) return `${styles.char} ${styles.charAtivo}`
    if (idx < posAtual - 1) return `${styles.char} ${styles.charConsumido}`
    return `${styles.char} ${styles.charNormal}`
  }

  // Ramos a exibir (limita para não sobrecarregar a UI)
  const ramosVisiveis = ramosAtivos.slice(0, MAX_RAMOS_VISIVEIS)
  const ramosOcultos = ramosAtivos.length - ramosVisiveis.length

  return (
    <div className={styles.painel}>
      {/* Entrada */}
      <div className={styles.linhaEntrada}>
        <span className={styles.rotulo}>Cadeia:</span>
        <input
          className={styles.input}
          type="text"
          value={entrada}
          onChange={e => setEntrada(e.target.value)}
          placeholder="ex: ab, aabb..."
          spellCheck={false}
        />
        {simboloInvalido !== null && (
          <span className={styles.aviso}>
            Símbolo &apos;{simboloInvalido}&apos; fora do alfabeto
          </span>
        )}
      </div>

      {/* Visualização da cadeia com destaque no símbolo consumido */}
      <div className={styles.visualizacaoCadeia}>
        {entrada.length === 0 ? (
          <span className={styles.vazio}>ε (cadeia vazia)</span>
        ) : (
          entrada.split('').map((c, i) => (
            <span key={i} className={classChar(i)}>{c}</span>
          ))
        )}
      </div>

      {/* Botões de controle */}
      <div className={styles.botoes}>
        <button
          className={`${styles.botao} ${styles.botaoDestaque}`}
          onClick={iniciar}
          disabled={simboloInvalido !== null || tocando}
        >
          Iniciar
        </button>
        <button
          className={styles.botao}
          onClick={anterior}
          disabled={!simulando || passoAtual <= 0 || tocando}
          title="Passo anterior"
        >
          ⏮ Anterior
        </button>
        <button
          className={styles.botao}
          onClick={proximo}
          disabled={!simulando || terminado || tocando}
          title="Próximo passo"
        >
          Próximo ⏭
        </button>
        {tocando ? (
          <button className={styles.botao} onClick={pause} title="Pausar">
            ⏸ Pausar
          </button>
        ) : (
          <button
            className={styles.botao}
            onClick={play}
            disabled={!simulando || terminado}
            title="Reproduzir automaticamente"
          >
            ▶ Play
          </button>
        )}
        <button
          className={styles.botao}
          onClick={reset}
          disabled={!simulando && passos.length === 0}
          title="Reiniciar"
        >
          🔄 Reset
        </button>
      </div>

      {/* Status + visualização dos ramos */}
      <div className={styles.rodape}>
        {/* Status textual */}
        <div className={styles.statusArea}>
          {!simulando && (
            <span className={styles.status}>Insira uma cadeia e clique em Iniciar.</span>
          )}
          {simulando && !terminado && (
            <span className={styles.status}>
              {ramosAtivos.length === 0
                ? 'Nenhum ramo ativo'
                : `${ramosAtivos.length} ramo${ramosAtivos.length > 1 ? 's' : ''} ativo${ramosAtivos.length > 1 ? 's' : ''}`}
            </span>
          )}
          {terminado && resultado === 'aceito' && (
            <span className={styles.statusAceito}>✓ Cadeia aceita</span>
          )}
          {terminado && resultado === 'rejeitado' && (
            <span className={styles.statusRejeitado}>✗ Cadeia rejeitada</span>
          )}
        </div>

        {/* Visualização das pilhas dos ramos ativos */}
        {simulando && ramosAtivos.length > 0 && (
          <div className={styles.ramosWrapper}>
            <div className={styles.ramosTitulo}>
              Ramos ativos
              {ramosOcultos > 0 && (
                <span className={styles.ramosOcultos}> (+{ramosOcultos})</span>
              )}
            </div>
            <div className={styles.ramosList}>
              {ramosVisiveis.map((ramo, idx) => {
                const pilhaExibida = [...ramo.pilha].reverse()
                return (
                  <div key={idx} className={styles.ramoItem}>
                    <div className={styles.ramoEstado}>{ramo.estado}</div>
                    <div className={styles.pilhaColuna}>
                      {pilhaExibida.length === 0 ? (
                        <div className={styles.pilhaVazia}>∅</div>
                      ) : (
                        pilhaExibida.map((sym, i) => (
                          <div
                            key={i}
                            className={`${styles.pilhaCelula} ${i === 0 ? styles.pilhaTopo : ''}`}
                          >
                            {sym}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
