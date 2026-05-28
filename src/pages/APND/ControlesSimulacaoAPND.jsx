import { validarEntrada } from '../../automata/apnd'
import styles from './ControlesSimulacaoAPND.module.css'

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

  const ramosVisiveis = ramosAtivos.slice(0, MAX_RAMOS_VISIVEIS)
  const ramosExtras = ramosAtivos.length > MAX_RAMOS_VISIVEIS
    ? ramosAtivos.length - MAX_RAMOS_VISIVEIS
    : 0

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
          placeholder="ex: ab, aabb, abba..."
          spellCheck={false}
        />
        {simboloInvalido !== null && (
          <span className={styles.aviso}>
            Símbolo &apos;{simboloInvalido}&apos; fora do alfabeto
          </span>
        )}
      </div>

      {/* Visualização da cadeia */}
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

      {/* Status + visualização dos ramos ativos */}
      <div className={styles.rodape}>
        <div className={styles.statusArea}>
          {!simulando && (
            <span className={styles.status}>Insira uma cadeia e clique em Iniciar.</span>
          )}
          {simulando && !terminado && (
            <span className={styles.status}>
              {ramosAtivos.length === 0
                ? 'Nenhum ramo ativo'
                : `${ramosAtivos.length} ramo${ramosAtivos.length > 1 ? 's' : ''} ativo${ramosAtivos.length > 1 ? 's' : ''}`
              }
            </span>
          )}
          {terminado && resultado === 'aceito' && (
            <span className={styles.statusAceito}>✓ Cadeia aceita</span>
          )}
          {terminado && resultado === 'rejeitado' && (
            <span className={styles.statusRejeitado}>✗ Cadeia rejeitada</span>
          )}
        </div>

        {/* Pilhas dos ramos ativos */}
        {simulando && ramosVisiveis.length > 0 && (
          <div className={styles.ramosWrapper}>
            <div className={styles.pilhaTitulo}>Ramos ativos</div>
            <div className={styles.ramosColunas}>
              {ramosVisiveis.map((ramo, i) => {
                const pilhaInv = [...ramo.pilha].reverse()
                return (
                  <div key={i} className={styles.ramoColuna}>
                    <div className={styles.ramoEstado}>{ramo.estado}</div>
                    <div className={styles.pilhaColuna}>
                      {pilhaInv.length === 0 ? (
                        <div className={styles.pilhaVazia}>∅</div>
                      ) : (
                        pilhaInv.map((sym, j) => (
                          <div
                            key={j}
                            className={`${styles.pilhaCelula} ${j === 0 ? styles.pilhaTopo : ''}`}
                          >
                            {sym}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
              {ramosExtras > 0 && (
                <div className={styles.ramoExtra}>+{ramosExtras}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
