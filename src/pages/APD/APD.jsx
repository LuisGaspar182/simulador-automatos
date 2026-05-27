import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import CanvasAPD from './CanvasAPD'
import ControlesSimulacaoAPD from './ControlesSimulacaoAPD'
import PainelEdicaoAPD from './PainelEdicaoAPD'
import useSimulacaoAPD from '../../hooks/useSimulacaoAPD'
import { apdExemploAnBn, layoutExemploAnBn } from '../../automata/apd'
import styles from './APD.module.css'

export default function APD() {
  const [apd, setApd] = useState(apdExemploAnBn)
  const [layout, setLayout] = useState(layoutExemploAnBn)
  const [entrada, setEntrada] = useState('')
  const [modo, setModo] = useState('selecionar')
  const [origemTransicao, setOrigemTransicao] = useState(null)

  const {
    passos,
    passoAtual,
    estadoAtivo,
    pilhaAtual,
    iniciar,
    proximo,
    anterior,
    reset,
    play,
    pause,
    tocando,
    resultado,
  } = useSimulacaoAPD(apd, entrada)

  const handleSetModo = useCallback((novoModo) => {
    setModo(novoModo)
    setOrigemTransicao(null)
  }, [])

  const handleMoverEstado = useCallback((estado, novaPos) => {
    setLayout(prev => ({ ...prev, [estado]: novaPos }))
  }, [])

  const handleClicarEstado = useCallback((estado) => {
    if (modo === 'removerEstado') {
      setApd(prev => {
        const novosEstados = prev.estados.filter(e => e !== estado)
        const novasTransicoes = {}
        for (const e of novosEstados) {
          if (!prev.transicoes[e]) continue
          const trans = {}
          for (const [chave, resultado] of Object.entries(prev.transicoes[e])) {
            // Mantém apenas transições cujo destino não é o estado removido
            if (resultado.estado !== estado) trans[chave] = resultado
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

      // Prompt 1: símbolo lido
      const rawSim = window.prompt(
        `Transição de ${origemTransicao} → ${estado}\n\nSímbolo lido (do alfabeto ou ε):\nAlfabeto: ${apd.alfabeto.join(', ')}`
      )
      if (rawSim === null) { setOrigemTransicao(null); return }
      const sim = rawSim.trim()
      if (sim !== 'ε' && !apd.alfabeto.includes(sim)) {
        window.alert(`'${sim}' não está no alfabeto de entrada [${apd.alfabeto.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      // Prompt 2: topo da pilha a consumir
      const rawTopo = window.prompt(
        `Topo da pilha a consumir:\nAlfabeto da pilha: ${apd.alfabetoPilha.join(', ')}`
      )
      if (rawTopo === null) { setOrigemTransicao(null); return }
      const topo = rawTopo.trim()
      if (!apd.alfabetoPilha.includes(topo)) {
        window.alert(`'${topo}' não está no alfabeto da pilha [${apd.alfabetoPilha.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      // Prompt 3: o que empilhar (vazio = só desempilha)
      const rawEmp = window.prompt(
        `O que empilhar após desempilhar '${topo}':\n(deixe vazio para apenas desempilhar)\nAlfabeto da pilha: ${apd.alfabetoPilha.join(', ')}`
      )
      if (rawEmp === null) { setOrigemTransicao(null); return }
      const emp = rawEmp.trim()
      for (const ch of emp) {
        if (!apd.alfabetoPilha.includes(ch)) {
          window.alert(`'${ch}' não está no alfabeto da pilha [${apd.alfabetoPilha.join(', ')}].`)
          setOrigemTransicao(null)
          return
        }
      }

      const chave = sim + ',' + topo
      if (apd.transicoes[origemTransicao]?.[chave]) {
        window.alert(
          `Já existe transição de ${origemTransicao} com símbolo '${sim}' e topo '${topo}'.`
        )
        setOrigemTransicao(null)
        return
      }

      setApd(prev => ({
        ...prev,
        transicoes: {
          ...prev.transicoes,
          [origemTransicao]: {
            ...(prev.transicoes[origemTransicao] ?? {}),
            [chave]: { estado, empilhar: emp },
          },
        },
      }))
      setOrigemTransicao(null)
    }
  }, [modo, origemTransicao, apd.alfabeto, apd.alfabetoPilha, apd.transicoes])

  const handleClicarVazio = useCallback((pos) => {
    if (modo === 'adicionarEstado') {
      let idx = 0
      while (apd.estados.includes(`q${idx}`)) idx++
      const novoEstado = `q${idx}`
      const estadoInicial = apd.estados.length === 0 ? novoEstado : apd.estadoInicial
      setApd(prev => ({
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
  }, [modo, apd])

  const handleDuploCliqueEstado = useCallback((estado) => {
    setApd(prev => {
      const eFinal = prev.estadosFinais.includes(estado)
      return {
        ...prev,
        estadosFinais: eFinal
          ? prev.estadosFinais.filter(e => e !== estado)
          : [...prev.estadosFinais, estado],
      }
    })
  }, [])

  const handleRemoverTransicao = useCallback((estadoOrigem, chave) => {
    setApd(prev => {
      const trans = { ...(prev.transicoes[estadoOrigem] ?? {}) }
      delete trans[chave]
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
        <h1 className={styles.titulo}>Simulador de APD</h1>
        <div className={styles.area}>
          <div className={styles.colunaPrincipal}>
            <CanvasAPD
              apd={apd}
              layout={layout}
              estadoAtivo={estadoAtivo}
              modo={modo}
              origemTransicao={origemTransicao}
              onMoverEstado={handleMoverEstado}
              onClicarEstado={handleClicarEstado}
              onClicarVazio={handleClicarVazio}
              onDuploCliqueEstado={handleDuploCliqueEstado}
            />
            <ControlesSimulacaoAPD
              apd={apd}
              entrada={entrada}
              setEntrada={setEntrada}
              passos={passos}
              passoAtual={passoAtual}
              pilhaAtual={pilhaAtual}
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
          <PainelEdicaoAPD
            apd={apd}
            setApd={setApd}
            modo={modo}
            setModo={handleSetModo}
            layout={layout}
            setLayout={setLayout}
            onResetSimulacao={reset}
            onRemoverTransicao={handleRemoverTransicao}
          />
        </div>
      </div>
    </Layout>
  )
}
