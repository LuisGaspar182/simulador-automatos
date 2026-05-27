import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import CanvasAPND from './CanvasAPND'
import ControlesSimulacaoAPND from './ControlesSimulacaoAPND'
import PainelEdicaoAPND from './PainelEdicaoAPND'
import useSimulacaoAPND from '../../hooks/useSimulacaoAPND'
import { apndExemploAnBn, layoutExemploAnBn } from '../../automata/apnd'
import styles from './APND.module.css'

export default function APND() {
  const [apnd, setApnd] = useState(apndExemploAnBn)
  const [layout, setLayout] = useState(layoutExemploAnBn)
  const [entrada, setEntrada] = useState('')
  const [modo, setModo] = useState('selecionar')
  const [origemTransicao, setOrigemTransicao] = useState(null)

  const {
    passos,
    passoAtual,
    estadosAtivos,
    ramosAtivos,
    iniciar,
    proximo,
    anterior,
    reset,
    play,
    pause,
    tocando,
    resultado,
  } = useSimulacaoAPND(apnd, entrada)

  const handleSetModo = useCallback((novoModo) => {
    setModo(novoModo)
    setOrigemTransicao(null)
  }, [])

  const handleMoverEstado = useCallback((estado, novaPos) => {
    setLayout(prev => ({ ...prev, [estado]: novaPos }))
  }, [])

  const handleClicarEstado = useCallback((estado) => {
    if (modo === 'removerEstado') {
      setApnd(prev => {
        const novosEstados = prev.estados.filter(e => e !== estado)
        const novasTransicoes = {}
        for (const e of novosEstados) {
          if (!prev.transicoes[e]) continue
          const trans = {}
          for (const [chave, resultados] of Object.entries(prev.transicoes[e])) {
            // Filtra resultados que apontam para o estado removido
            const filtrado = resultados.filter(r => r.estado !== estado)
            if (filtrado.length > 0) trans[chave] = filtrado
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

      // Prompt 1: símbolo lido (ou ε)
      const rawSim = window.prompt(
        `Transição de ${origemTransicao} → ${estado}\n\nSímbolo lido (do alfabeto ou ε):\nAlfabeto: ${apnd.alfabeto.join(', ')}`
      )
      if (rawSim === null) { setOrigemTransicao(null); return }
      const sim = rawSim.trim()
      if (sim !== 'ε' && !apnd.alfabeto.includes(sim)) {
        window.alert(`'${sim}' não está no alfabeto de entrada [${apnd.alfabeto.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      // Prompt 2: topo da pilha a consumir
      const rawTopo = window.prompt(
        `Topo da pilha a consumir:\nAlfabeto da pilha: ${apnd.alfabetoPilha.join(', ')}`
      )
      if (rawTopo === null) { setOrigemTransicao(null); return }
      const topo = rawTopo.trim()
      if (!apnd.alfabetoPilha.includes(topo)) {
        window.alert(`'${topo}' não está no alfabeto da pilha [${apnd.alfabetoPilha.join(', ')}].`)
        setOrigemTransicao(null)
        return
      }

      // Prompt 3: o que empilhar (vazio = só desempilha)
      const rawEmp = window.prompt(
        `O que empilhar após desempilhar '${topo}':\n(deixe vazio para apenas desempilhar)\nAlfabeto da pilha: ${apnd.alfabetoPilha.join(', ')}`
      )
      if (rawEmp === null) { setOrigemTransicao(null); return }
      const emp = rawEmp.trim()
      for (const ch of emp) {
        if (!apnd.alfabetoPilha.includes(ch)) {
          window.alert(`'${ch}' não está no alfabeto da pilha [${apnd.alfabetoPilha.join(', ')}].`)
          setOrigemTransicao(null)
          return
        }
      }

      const chave = sim + ',' + topo
      const novoResultado = { estado, empilhar: emp }

      // No APND, múltiplos resultados para a mesma chave são permitidos
      // Verifica apenas se o resultado exato já existe (estado + empilhar idênticos)
      const existentes = apnd.transicoes[origemTransicao]?.[chave] ?? []
      const jaExiste = existentes.some(r => r.estado === estado && r.empilhar === emp)
      if (jaExiste) {
        window.alert(
          `A transição δ(${origemTransicao}, ${sim}, ${topo}) = (${estado}, ${emp || 'ε'}) já existe.`
        )
        setOrigemTransicao(null)
        return
      }

      setApnd(prev => ({
        ...prev,
        transicoes: {
          ...prev.transicoes,
          [origemTransicao]: {
            ...(prev.transicoes[origemTransicao] ?? {}),
            [chave]: [
              ...(prev.transicoes[origemTransicao]?.[chave] ?? []),
              novoResultado,
            ],
          },
        },
      }))
      setOrigemTransicao(null)
    }
  }, [modo, origemTransicao, apnd.alfabeto, apnd.alfabetoPilha, apnd.transicoes])

  const handleClicarVazio = useCallback((pos) => {
    if (modo === 'adicionarEstado') {
      let idx = 0
      while (apnd.estados.includes(`q${idx}`)) idx++
      const novoEstado = `q${idx}`
      const estadoInicial = apnd.estados.length === 0 ? novoEstado : apnd.estadoInicial
      setApnd(prev => ({
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
  }, [modo, apnd])

  const handleDuploCliqueEstado = useCallback((estado) => {
    setApnd(prev => {
      const eFinal = prev.estadosFinais.includes(estado)
      return {
        ...prev,
        estadosFinais: eFinal
          ? prev.estadosFinais.filter(e => e !== estado)
          : [...prev.estadosFinais, estado],
      }
    })
  }, [])

  // Remove um resultado específico de uma transição (pelo índice no array)
  const handleRemoverTransicao = useCallback((estadoOrigem, chave, indice) => {
    setApnd(prev => {
      const trans = { ...(prev.transicoes[estadoOrigem] ?? {}) }
      const resultados = [...(trans[chave] ?? [])]
      resultados.splice(indice, 1)
      if (resultados.length === 0) {
        delete trans[chave]
      } else {
        trans[chave] = resultados
      }
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
        <h1 className={styles.titulo}>Simulador de APND</h1>
        <div className={styles.area}>
          <div className={styles.colunaPrincipal}>
            <CanvasAPND
              apnd={apnd}
              layout={layout}
              estadosAtivos={estadosAtivos}
              modo={modo}
              origemTransicao={origemTransicao}
              onMoverEstado={handleMoverEstado}
              onClicarEstado={handleClicarEstado}
              onClicarVazio={handleClicarVazio}
              onDuploCliqueEstado={handleDuploCliqueEstado}
            />
            <ControlesSimulacaoAPND
              apnd={apnd}
              entrada={entrada}
              setEntrada={setEntrada}
              passos={passos}
              passoAtual={passoAtual}
              ramosAtivos={ramosAtivos}
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
          <PainelEdicaoAPND
            apnd={apnd}
            setApnd={setApnd}
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
