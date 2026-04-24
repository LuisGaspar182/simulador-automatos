import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import CanvasAFD from './CanvasAFD'
import ControlesSimulacao from './ControlesSimulacao'
import PainelEdicaoAFD from './PainelEdicaoAFD'
import useSimulacaoAFD from '../../hooks/useSimulacaoAFD'
import {
  afdExemploTerminaEm01,
  layoutExemploTerminaEm01,
} from '../../automata/afd'
import styles from './AFD.module.css'

export default function AFD() {
  const [afd, setAfd] = useState(afdExemploTerminaEm01)
  const [layout, setLayout] = useState(layoutExemploTerminaEm01)
  const [entrada, setEntrada] = useState('')
  const [modo, setModo] = useState('selecionar')
  const [origemTransicao, setOrigemTransicao] = useState(null)

  const {
    passos,
    passoAtual,
    estadoAtivo,
    iniciar,
    proximo,
    anterior,
    reset,
    play,
    pause,
    tocando,
    resultado,
  } = useSimulacaoAFD(afd, entrada)

  const handleSetModo = useCallback((novoModo) => {
    setModo(novoModo)
    setOrigemTransicao(null)
  }, [])

  const handleMoverEstado = useCallback((estado, novaPos) => {
    setLayout(prev => ({ ...prev, [estado]: novaPos }))
  }, [])

  const handleClicarEstado = useCallback((estado) => {
    if (modo === 'removerEstado') {
      setAfd(prev => {
        const novosEstados = prev.estados.filter(e => e !== estado)
        const novasTransicoes = {}
        for (const e of novosEstados) {
          if (!prev.transicoes[e]) continue
          const trans = {}
          for (const [sim, dest] of Object.entries(prev.transicoes[e])) {
            if (dest !== estado) trans[sim] = dest
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
        `Símbolo da transição de ${origemTransicao} → ${estado}\nAlfabeto: ${afd.alfabeto.join(', ')}`
      )
      if (simbolo === null) {
        setOrigemTransicao(null)
        return
      }
      const sim = simbolo.trim()
      if (!afd.alfabeto.includes(sim)) {
        window.alert(`Símbolo '${sim}' não está no alfabeto [${afd.alfabeto.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }
      if (afd.transicoes[origemTransicao]?.[sim]) {
        window.alert(
          `Transição de ${origemTransicao} com '${sim}' já existe para ${afd.transicoes[origemTransicao][sim]}.`
        )
        setOrigemTransicao(null)
        return
      }
      setAfd(prev => ({
        ...prev,
        transicoes: {
          ...prev.transicoes,
          [origemTransicao]: {
            ...(prev.transicoes[origemTransicao] ?? {}),
            [sim]: estado,
          },
        },
      }))
      setOrigemTransicao(null)
      return
    }
  }, [modo, origemTransicao, afd.alfabeto, afd.transicoes])

  const handleClicarVazio = useCallback((pos) => {
    if (modo === 'adicionarEstado') {
      let idx = 0
      while (afd.estados.includes(`q${idx}`)) idx++
      const novoEstado = `q${idx}`
      const estadoInicial = afd.estados.length === 0 ? novoEstado : afd.estadoInicial
      setAfd(prev => ({
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
  }, [modo, afd])

  const handleDuploCliqueEstado = useCallback((estado) => {
    setAfd(prev => {
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
        <h1 className={styles.titulo}>Simulador de AFD</h1>
        <div className={styles.area}>
          <div className={styles.colunaPrincipal}>
            <CanvasAFD
              afd={afd}
              layout={layout}
              estadoAtivo={estadoAtivo}
              modo={modo}
              origemTransicao={origemTransicao}
              onMoverEstado={handleMoverEstado}
              onClicarEstado={handleClicarEstado}
              onClicarVazio={handleClicarVazio}
              onDuploCliqueEstado={handleDuploCliqueEstado}
            />
            <ControlesSimulacao
              afd={afd}
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
          <PainelEdicaoAFD
            afd={afd}
            setAfd={setAfd}
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
