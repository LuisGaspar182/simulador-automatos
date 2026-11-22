import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import CanvasMT from './CanvasMT'
import ControlesSimulacaoMT from './ControlesSimulacaoMT'
import PainelEdicaoMT from './PainelEdicaoMT'
import useSimulacaoMT from '../../hooks/useSimulacaoMT'
import { mtExemploAnBn, layoutExemploAnBn } from '../../automata/mt'
import styles from './MT.module.css'

export default function MT() {
  const [mt, setMt] = useState(mtExemploAnBn)
  const [layout, setLayout] = useState(layoutExemploAnBn)
  const [entrada, setEntrada] = useState('')
  const [modo, setModo] = useState('selecionar')
  const [origemTransicao, setOrigemTransicao] = useState(null)
  const [painelVisivel, setPainelVisivel] = useState(false)

  const {
    passos,
    passoAtual,
    estadoAtivo,
    fitaAtual,
    cabecaAtual,
    iniciar,
    proximo,
    anterior,
    reset,
    play,
    pause,
    tocando,
    resultado,
  } = useSimulacaoMT(mt, entrada)

  const handleSetModo = useCallback((novoModo) => {
    setModo(novoModo)
    setOrigemTransicao(null)
  }, [])

  const handleMoverEstado = useCallback((estado, novaPos) => {
    setLayout(prev => ({ ...prev, [estado]: novaPos }))
  }, [])

  const handleClicarEstado = useCallback((estado) => {
    if (modo === 'removerEstado') {
      setMt(prev => {
        const novosEstados = prev.estados.filter(e => e !== estado)
        const novasTransicoes = {}
        for (const e of novosEstados) {
          if (!prev.transicoes[e]) continue
          const trans = {}
          for (const [lido, resultado] of Object.entries(prev.transicoes[e])) {
            if (resultado.estado !== estado) trans[lido] = resultado
          }
          if (Object.keys(trans).length > 0) novasTransicoes[e] = trans
        }
        return {
          ...prev,
          estados: novosEstados,
          transicoes: novasTransicoes,
          estadoInicial: prev.estadoInicial === estado ? '' : prev.estadoInicial,
          estadosFinais: prev.estadosFinais.filter(e => e !== estado),
        }
      })
      setLayout(prev => {
        const novo = { ...prev }
        delete novo[estado]
        return novo
      })
      return
    }

    if (modo === 'adicionarTransicao') {
      if (origemTransicao === null) {
        setOrigemTransicao(estado)
        return
      }

      const rawLido = window.prompt(
        `Transição de ${origemTransicao} → ${estado}\n\nSímbolo a LER da fita:\nAlfabeto de fita: ${mt.alfabetaFita.join(', ')}`
      )
      if (rawLido === null) { setOrigemTransicao(null); return }
      const lido = rawLido.trim()
      if (!mt.alfabetaFita.includes(lido)) {
        window.alert(`'${lido}' não está no alfabeto de fita [${mt.alfabetaFita.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      if (mt.transicoes[origemTransicao]?.[lido]) {
        window.alert(`Já existe transição de '${origemTransicao}' lendo '${lido}'.`)
        setOrigemTransicao(null)
        return
      }

      const rawEscrito = window.prompt(
        `Símbolo a ESCREVER na fita:\nAlfabeto de fita: ${mt.alfabetaFita.join(', ')}`
      )
      if (rawEscrito === null) { setOrigemTransicao(null); return }
      const escrito = rawEscrito.trim()
      if (!mt.alfabetaFita.includes(escrito)) {
        window.alert(`'${escrito}' não está no alfabeto de fita [${mt.alfabetaFita.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      const rawDir = window.prompt('Direção do cabeçote:\nD = direita   E = esquerda')
      if (rawDir === null) { setOrigemTransicao(null); return }
      const dir = rawDir.trim().toUpperCase()
      if (dir !== 'D' && dir !== 'E') {
        window.alert("Direção inválida. Use 'D' (direita) ou 'E' (esquerda).")
        setOrigemTransicao(null)
        return
      }

      setMt(prev => ({
        ...prev,
        transicoes: {
          ...prev.transicoes,
          [origemTransicao]: {
            ...(prev.transicoes[origemTransicao] ?? {}),
            [lido]: { estado, escrever: escrito, direcao: dir },
          },
        },
      }))
      setOrigemTransicao(null)
    }
  }, [modo, origemTransicao, mt.alfabetaFita, mt.transicoes])

  const handleClicarVazio = useCallback((pos) => {
    if (modo === 'adicionarEstado') {
      let idx = 0
      while (mt.estados.includes(`q${idx}`)) idx++
      const novoEstado = `q${idx}`
      const estadoInicial = mt.estados.length === 0 ? novoEstado : mt.estadoInicial
      setMt(prev => ({
        ...prev,
        estados: [...prev.estados, novoEstado],
        estadoInicial,
        transicoes: { ...prev.transicoes, [novoEstado]: {} },
      }))
      setLayout(prev => ({ ...prev, [novoEstado]: { x: pos.x, y: pos.y } }))
      return
    }

    if (modo === 'adicionarTransicao') {
      setOrigemTransicao(null)
    }
  }, [modo, mt])

  const handleDuploCliqueEstado = useCallback((estado) => {
    setMt(prev => {
      const eFinal = prev.estadosFinais.includes(estado)
      return {
        ...prev,
        estadosFinais: eFinal
          ? prev.estadosFinais.filter(e => e !== estado)
          : [...prev.estadosFinais, estado],
      }
    })
  }, [])

  const handleRemoverTransicao = useCallback((estadoOrigem, lido) => {
    setMt(prev => {
      const trans = { ...(prev.transicoes[estadoOrigem] ?? {}) }
      delete trans[lido]
      return {
        ...prev,
        transicoes: { ...prev.transicoes, [estadoOrigem]: trans },
      }
    })
    reset()
  }, [reset])

  return (
    <Layout>
      <div className={styles.pagina}>
        <h1 className={styles.titulo}>Simulador de Máquina de Turing</h1>
        <div className={styles.area}>
          <div className={styles.colunaPrincipal}>
            <CanvasMT
              mt={mt}
              layout={layout}
              estadoAtivo={estadoAtivo}
              modo={modo}
              origemTransicao={origemTransicao}
              onMoverEstado={handleMoverEstado}
              onClicarEstado={handleClicarEstado}
              onClicarVazio={handleClicarVazio}
              onDuploCliqueEstado={handleDuploCliqueEstado}
            />
            <ControlesSimulacaoMT
              mt={mt}
              entrada={entrada}
              setEntrada={setEntrada}
              passos={passos}
              passoAtual={passoAtual}
              fitaAtual={fitaAtual}
              cabecaAtual={cabecaAtual}
              resultado={resultado}
              iniciar={iniciar}
              proximo={proximo}
              anterior={anterior}
              reset={reset}
              play={play}
              pause={pause}
              tocando={tocando}
            />
          </div>
          <aside className={`${styles.painelLateral} ${painelVisivel ? styles.painelAberto : ''}`}>
            <button
              className={styles.togglePainel}
              onClick={() => setPainelVisivel(v => !v)}
            >
              <span>⚙ Editar autômato</span>
              <span>{painelVisivel ? '▲' : '▼'}</span>
            </button>
            <div className={styles.painelConteudo}>
              <PainelEdicaoMT
                mt={mt}
                setMt={setMt}
                modo={modo}
                setModo={handleSetModo}
                layout={layout}
                setLayout={setLayout}
                onResetSimulacao={reset}
                onRemoverTransicao={handleRemoverTransicao}
              />
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
