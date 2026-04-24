import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import CanvasAFND from './CanvasAFND'
import ControlesSimulacao from './ControlesSimulacao'
import PainelEdicaoAFND from './PainelEdicaoAFND'
import useSimulacaoAFND from '../../hooks/useSimulacaoAFND'
import { afndExemplopenultimo1, layoutExemplopenultimo1 } from '../../automata/afnd'
import styles from './AFND.module.css'

export default function AFND() {
  const [afnd, setAfnd] = useState(afndExemplopenultimo1)
  const [layout, setLayout] = useState(layoutExemplopenultimo1)
  const [entrada, setEntrada] = useState('')
  const [modo, setModo] = useState('selecionar')
  const [origemTransicao, setOrigemTransicao] = useState(null)

  const {
    passos,
    passoAtual,
    estadosAtivos,
    iniciar,
    proximo,
    anterior,
    reset,
    play,
    pause,
    tocando,
    resultado,
  } = useSimulacaoAFND(afnd, entrada)

  const handleSetModo = useCallback((novoModo) => {
    setModo(novoModo)
    setOrigemTransicao(null)
  }, [])

  const handleMoverEstado = useCallback((estado, novaPos) => {
    setLayout(prev => ({ ...prev, [estado]: novaPos }))
  }, [])

  const handleClicarEstado = useCallback((estado) => {
    if (modo === 'removerEstado') {
      setAfnd(prev => {
        const novosEstados = prev.estados.filter(e => e !== estado)
        const novasTransicoes = {}
        for (const e of novosEstados) {
          if (!prev.transicoes[e]) continue
          const trans = {}
          for (const [sim, dests] of Object.entries(prev.transicoes[e])) {
            const filtrado = dests.filter(d => d !== estado)
            if (filtrado.length > 0) trans[sim] = filtrado
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
      const simbolo = window.prompt(
        `Símbolo da transição de ${origemTransicao} → ${estado}\nAlfabeto: ${afnd.alfabeto.join(', ')} (ou ε)`
      )
      if (simbolo === null) {
        setOrigemTransicao(null)
        return
      }
      const sim = simbolo.trim()
      if (sim !== 'ε' && !afnd.alfabeto.includes(sim)) {
        window.alert(`Símbolo '${sim}' não está no alfabeto [${afnd.alfabeto.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }
      if (afnd.transicoes[origemTransicao]?.[sim]?.includes(estado)) {
        window.alert(`Transição de ${origemTransicao} com '${sim}' para ${estado} já existe.`)
        setOrigemTransicao(null)
        return
      }
      setAfnd(prev => ({
        ...prev,
        transicoes: {
          ...prev.transicoes,
          [origemTransicao]: {
            ...(prev.transicoes[origemTransicao] ?? {}),
            [sim]: [...(prev.transicoes[origemTransicao]?.[sim] ?? []), estado],
          },
        },
      }))
      setOrigemTransicao(null)
      return
    }
  }, [modo, origemTransicao, afnd.alfabeto, afnd.transicoes])

  const handleClicarVazio = useCallback((pos) => {
    if (modo === 'adicionarEstado') {
      let idx = 0
      while (afnd.estados.includes(`q${idx}`)) idx++
      const novoEstado = `q${idx}`
      const estadoInicial = afnd.estados.length === 0 ? novoEstado : afnd.estadoInicial
      setAfnd(prev => ({
        ...prev,
        estados: [...prev.estados, novoEstado],
        estadoInicial,
      }))
      setLayout(prev => ({ ...prev, [novoEstado]: { x: pos.x, y: pos.y } }))
      return
    }

    if (modo === 'adicionarTransicao') {
      setOrigemTransicao(null)
    }
  }, [modo, afnd])

  const handleDuploCliqueEstado = useCallback((estado) => {
    setAfnd(prev => {
      const eFinal = prev.estadosFinais.includes(estado)
      return {
        ...prev,
        estadosFinais: eFinal
          ? prev.estadosFinais.filter(e => e !== estado)
          : [...prev.estadosFinais, estado],
      }
    })
  }, [])

  return (
    <Layout>
      <div className={styles.pagina}>
        <h1 className={styles.titulo}>Simulador de AFND</h1>
        <div className={styles.area}>
          <div className={styles.colunaPrincipal}>
            <CanvasAFND
              afnd={afnd}
              layout={layout}
              estadosAtivos={estadosAtivos}
              modo={modo}
              origemTransicao={origemTransicao}
              onMoverEstado={handleMoverEstado}
              onClicarEstado={handleClicarEstado}
              onClicarVazio={handleClicarVazio}
              onDuploCliqueEstado={handleDuploCliqueEstado}
            />
            <ControlesSimulacao
              afd={afnd}
              entrada={entrada}
              setEntrada={setEntrada}
              passos={passos}
              passoAtual={passoAtual}
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
          <PainelEdicaoAFND
            afnd={afnd}
            setAfnd={setAfnd}
            modo={modo}
            setModo={handleSetModo}
            layout={layout}
            setLayout={setLayout}
            onResetSimulacao={reset}
          />
        </div>
      </div>
    </Layout>
  )
}
