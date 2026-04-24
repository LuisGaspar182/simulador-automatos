// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null se todos são válidos
export function validarEntrada(afnd, entrada) {
  for (const simbolo of entrada) {
    if (!afnd.alfabeto.includes(simbolo)) return simbolo;
  }
  return null;
}

// Retorna todos os estados alcançáveis via ε a partir de um conjunto de estados
export function epsilonFecho(afnd, estados) {
  const fecho = new Set(estados)
  const fila = [...estados]
  while (fila.length > 0) {
    const e = fila.pop()
    const destinos = afnd.transicoes[e]?.['ε'] ?? []
    for (const d of destinos) {
      if (!fecho.has(d)) {
        fecho.add(d)
        fila.push(d)
      }
    }
  }
  return [...fecho]
}

// Retorna a união dos destinos de todos os estados dado um símbolo
export function mover(afnd, estados, simbolo) {
  const resultado = new Set()
  for (const e of estados) {
    const destinos = afnd.transicoes[e]?.[simbolo] ?? []
    for (const d of destinos) resultado.add(d)
  }
  return [...resultado]
}

// Executa a simulação do AFND e retorna a sequência de passos
export function simular(afnd, entrada) {
  const estadosIniciais = epsilonFecho(afnd, [afnd.estadoInicial])
  const passos = [{ estados: estadosIniciais, posicao: 0, simboloConsumido: null }]

  let estadosAtivos = estadosIniciais

  for (let i = 0; i < entrada.length; i++) {
    const simbolo = entrada[i]
    const proximos = epsilonFecho(afnd, mover(afnd, estadosAtivos, simbolo))

    if (proximos.length === 0) {
      passos.push({
        estados: [],
        posicao: i,
        simboloConsumido: simbolo,
        erro: `Nenhuma transição possível com '${simbolo}'`,
      })
      return passos
    }

    estadosAtivos = proximos
    passos.push({ estados: estadosAtivos, posicao: i + 1, simboloConsumido: simbolo })
  }

  const ultimo = passos[passos.length - 1]
  ultimo.aceito = ultimo.estados.some(e => afnd.estadosFinais.includes(e))
  return passos
}


// Linguagem: cadeias sobre {0,1} cujo penúltimo símbolo é 1
export const afndExemplopenultimo1 = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['0', '1'],
  transicoes: {
    q0: {'0': ['q0'], '1': ['q0','q1']},
    q1: {'0': ['q2'], '1': ['q2']},
    q2: {}
  },
  estadoInicial: 'q0',
  estadosFinais: ['q2'],
}

export const layoutExemplopenultimo1 = {
  q0: { x: 120, y: 250 },
  q1: { x: 320, y: 250 },
  q2: { x: 520, y: 250 },
}

// L = {w ∈ {0,1}* | w representa em binário um número divisível por 2 ou por 3}
export const afndExemplodivisivelpor2ou3 = {
  estados: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5'],
  alfabeto: ['0', '1'],
  transicoes: {
    q0: { 'ε': ['q1', 'q2'] },
    q1: { '0': ['q3'], '1': ['q1'] },
    q3: { '0': ['q3'], '1': ['q1'] },
    q2: { '0': ['q2'], '1': ['q4'] },
    q4: { '0': ['q5'], '1': ['q2'] },
    q5: { '0': ['q4'], '1': ['q5'] }
  },
  estadoInicial: 'q0',
  estadosFinais: ['q3', 'q2'],
}

// q0 no centro-esquerdo bifurca em dois ramos via ε:
// ramo superior (q1→q3): divisível por 2
// ramo inferior (q2→q4→q5): divisível por 3 (aritmética modular)
export const layoutExemplodivisivelpor2ou3 = {
  q0: { x:  80, y: 250 },
  q1: { x: 260, y: 140 },
  q3: { x: 460, y: 140 },
  q2: { x: 260, y: 360 },
  q4: { x: 460, y: 360 },
  q5: { x: 580, y: 250 },
}