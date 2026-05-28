import { useState, useEffect, useCallback } from 'react'
import { simular } from '../automata/apnd'

export default function useSimulacaoAPND(apnd, entrada) {
  const [passos, setPassos] = useState([])
  const [passoAtual, setPassoAtual] = useState(-1)
  const [tocando, setTocando] = useState(false)

  useEffect(() => {
    if (!tocando) return
    const tamanho = passos.length
    let step = passoAtual
    const id = setInterval(() => {
      if (step >= tamanho - 1) {
        clearInterval(id)
        setTocando(false)
        return
      }
      step += 1
      setPassoAtual(step)
      if (step >= tamanho - 1) {
        clearInterval(id)
        setTocando(false)
      }
    }, 700)
    return () => clearInterval(id)
  }, [tocando, passos.length, passoAtual])

  const iniciar = useCallback(() => {
    setTocando(false)
    const novosPassos = simular(apnd, entrada)
    setPassos(novosPassos)
    setPassoAtual(0)
  }, [apnd, entrada])

  const reset = useCallback(() => {
    setTocando(false)
    setPassos([])
    setPassoAtual(-1)
  }, [])

  const proximo = useCallback(() => {
    setPassoAtual(p => Math.min(p + 1, passos.length - 1))
  }, [passos.length])

  const anterior = useCallback(() => {
    setPassoAtual(p => Math.max(p - 1, 0))
  }, [])

  const play = useCallback(() => {
    if (!passos.length || passoAtual >= passos.length - 1) return
    setTocando(true)
  }, [passos.length, passoAtual])

  const pause = useCallback(() => {
    setTocando(false)
  }, [])

  const passoInfo = passoAtual >= 0 ? passos[passoAtual] : null

  // Lista deduplicada de estados ativos (para destacar no canvas)
  const estadosAtivos = passoInfo
    ? [...new Set(passoInfo.ramos.map(r => r.estado))]
    : []

  // Todos os ramos ativos com estado + pilha
  const ramosAtivos = passoInfo ? passoInfo.ramos : []

  let resultado = 'parado'
  if (passoAtual >= 0 && passos.length > 0) {
    if (passoAtual < passos.length - 1) {
      resultado = 'em_andamento'
    } else {
      const ultimo = passos[passos.length - 1]
      resultado = ultimo.aceito ? 'aceito' : 'rejeitado'
    }
  }

  return {
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
  }
}
