import { useRef, useEffect } from 'react'
import { validarEntrada } from '../../automata/mt'
import styles from './ControlesSimulacaoMT.module.css'

const JANELA = 13

export default function ControlesSimulacaoMT({
  mt,
  entrada,
  setEntrada,
  passos,
  passoAtual,
  fitaAtual,
  cabecaAtual,
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
  const simboloInvalido = mt.alfabeto.length > 0 ? validarEntrada(mt, entrada) : null

  const passoInfo = passos[passoAtual] ?? null

  // Janela de células centrada no cabeçote
  const cabeca = simulando ? cabecaAtual : 0
  const fita = simulando ? fitaAtual : []

  const inicio = Math.max(0, cabeca - Math.floor(JANELA / 2))
  const celulas = []
  for (let i = inicio; i < inicio + JANELA; i++) {
    const simbolo = i < fita.length ? fita[i] : mt.branco
    celulas.push({ pos: i, simbolo, isHead: i === cabeca, isBoundary: i === 0 })
  }

  const cabecaRef = useRef(null)
  useEffect(() => {
    cabecaRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [cabecaAtual])

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

      {/* Visualização da fita */}
      <div className={styles.fitaWrapper}>
        <div className={styles.fitaTitulo}>Fita</div>
        <div className={styles.fitaScroll}>
          {simulando && celulas.map(({ pos, simbolo, isHead, isBoundary }) => (
            <div
              key={pos}
              ref={isHead ? cabecaRef : null}
              className={[
                styles.celula,
                isHead ? styles.celulaAtiva : '',
                isBoundary ? styles.celulaBorda : '',
              ].join(' ')}
            >
              {simbolo === mt.branco ? '□' : simbolo}
              {isHead && <div className={styles.cabecote}>▲</div>}
            </div>
          ))}
          {!simulando && (
            <span className={styles.fitaVazia}>Inicie a simulação para ver a fita</span>
          )}
        </div>
        {simulando && (
          <div className={styles.fitaInfo}>
            Posição: {cabecaAtual} &nbsp;|&nbsp; Estado: <strong>{passoInfo?.estado ?? '—'}</strong>
          </div>
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
      <div className={styles.statusArea}>
        {!simulando && (
          <span className={styles.status}>Insira uma cadeia e clique em Iniciar.</span>
        )}
        {simulando && !terminado && (
          <span className={styles.status}>
            Passo {passoAtual + 1} de {passos.length}
          </span>
        )}
        {terminado && resultado === 'aceito' && (
          <span className={styles.statusAceito}>✓ Cadeia aceita</span>
        )}
        {terminado && resultado === 'rejeitado' && (
          <span className={styles.statusRejeitado}>
            ✗ Cadeia rejeitada
            {passoInfo?.erro ? ` — ${passoInfo.erro}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}
