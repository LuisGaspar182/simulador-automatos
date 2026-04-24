import { validarEntrada } from '../../automata/afd'
import styles from './ControlesSimulacao.module.css'

export default function ControlesSimulacao({
  afd,
  entrada,
  setEntrada,
  passos,
  passoAtual,
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
  const simboloInvalido = afd.alfabeto.length > 0 ? validarEntrada(afd, entrada) : null

  // Símbolo que está sendo consumido no passo atual (não no inicial)
  const passoInfo = passos[passoAtual] ?? null
  const posAtual = passoInfo?.posicao ?? 0
  const simboloAtualIdx = passoAtual > 0 ? posAtual - 1 : -1

  function classChar(idx) {
    if (idx === simboloAtualIdx) return `${styles.char} ${styles.charAtivo}`
    if (idx < posAtual - 1) return `${styles.char} ${styles.charConsumido}`
    return `${styles.char} ${styles.charNormal}`
  }

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
          placeholder="ex: 01, 1001..."
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
            <span key={i} className={classChar(i)}>
              {c}
            </span>
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

      {/* Status */}
      <div>
        {!simulando && (
          <span className={styles.status}>Insira uma cadeia e clique em Iniciar.</span>
        )}
        {simulando && !terminado && (
          <span className={styles.status}>
            Estado atual: <strong>{passoInfo?.estado ?? '—'}</strong>
          </span>
        )}
        {terminado && resultado === 'aceito' && (
          <span className={styles.statusAceito}>✓ Cadeia aceita — estado: {passoInfo?.estado}</span>
        )}
        {terminado && resultado === 'rejeitado' && (
          <span className={styles.statusRejeitado}>
            ✗ Cadeia rejeitada
            {passoInfo?.erro ? ` — ${passoInfo.erro}` : passoInfo?.estado ? ` — estado: ${passoInfo.estado}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}
