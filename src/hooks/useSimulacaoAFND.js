import { useState, useEffect, useCallback } from 'react';
import { simular } from '../automata/afnd';

// Hook que controla a simulação passo a passo de um AFND
export default function useSimulacaoAFND(afnd, entrada) {
  const [passos, setPassos] = useState([]);
  const [passoAtual, setPassoAtual] = useState(-1);
  const [tocando, setTocando] = useState(false);

  // Avança os passos automaticamente em intervalos enquanto tocando for true
  useEffect(() => {
    if (!tocando) return;
    const tamanho = passos.length;
    let step = passoAtual;
    const id = setInterval(() => {
      if (step >= tamanho - 1) {
        clearInterval(id);
        setTocando(false);
        return;
      }
      step += 1;
      setPassoAtual(step);
      if (step >= tamanho - 1) {
        clearInterval(id);
        setTocando(false);
      }
    }, 700);
    return () => clearInterval(id);
  }, [tocando, passos.length, passoAtual]);

  const iniciar = useCallback(() => {
    setTocando(false);
    const novosPassos = simular(afnd, entrada);
    setPassos(novosPassos);
    setPassoAtual(0);
  }, [afnd, entrada]);

  const reset = useCallback(() => {
    setTocando(false);
    setPassos([]);
    setPassoAtual(-1);
  }, []);

  const proximo = useCallback(() => {
    setPassoAtual(p => Math.min(p + 1, passos.length - 1));
  }, [passos.length]);

  const anterior = useCallback(() => {
    setPassoAtual(p => Math.max(p - 1, 0));
  }, []);

  const play = useCallback(() => {
    if (!passos.length || passoAtual >= passos.length - 1) return;
    setTocando(true);
  }, [passos.length, passoAtual]);

  const pause = useCallback(() => {
    setTocando(false);
  }, []);

  const estadosAtivos =
    passoAtual >= 0 && passos[passoAtual] ? passos[passoAtual].estados : [];

  let resultado = 'parado';
  if (passoAtual >= 0 && passos.length > 0) {
    if (passoAtual < passos.length - 1) {
      resultado = 'em_andamento';
    } else {
      const ultimo = passos[passos.length - 1];
      resultado = ultimo.erro ? 'rejeitado' : ultimo.aceito ? 'aceito' : 'rejeitado';
    }
  }

  return {
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
  };
}
