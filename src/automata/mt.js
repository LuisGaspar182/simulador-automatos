// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null
export function validarEntrada(mt, entrada) {
  for (const simbolo of entrada) {
    if (!mt.alfabeto.includes(simbolo)) return simbolo
  }
  return null
}

// Executa a simulação passo a passo de uma MT determinística de fita única
// Passo: { estado, fita, cabeca, aceito?, erro? }
// Fita: array de chars, cabeca: índice do cabeçote
export function simular(mt, entrada) {
  const MAX_PASSOS = 1000

  const fita = entrada.length > 0 ? [...entrada] : [mt.branco]
  let cabeca = 0
  let estado = mt.estadoInicial

  while (cabeca >= fita.length) fita.push(mt.branco)

  const passos = [{ estado, fita: [...fita], cabeca }]

  for (let iter = 0; iter < MAX_PASSOS; iter++) {
    if (mt.estadosFinais.includes(estado)) {
      passos[passos.length - 1].aceito = true
      return passos
    }

    while (cabeca >= fita.length) fita.push(mt.branco)
    const simboloLido = fita[cabeca]

    const trans = mt.transicoes[estado]?.[simboloLido]
    if (!trans) {
      passos[passos.length - 1].aceito = false
      passos[passos.length - 1].erro = `Sem transição de '${estado}' com '${simboloLido}'`
      return passos
    }

    fita[cabeca] = trans.escrever
    cabeca = Math.max(0, cabeca + (trans.direcao === 'D' ? 1 : -1))
    estado = trans.estado

    while (cabeca >= fita.length) fita.push(mt.branco)
    passos.push({ estado, fita: [...fita], cabeca })
  }

  passos[passos.length - 1].erro = 'Limite de passos atingido (possível loop infinito)'
  return passos
}

// L = { aⁿbⁿ | n ≥ 1 }
// Marca a's como X, b's como Y de forma casada
export const mtExemploAnBn = {
  estados: ['q0', 'q1', 'q2', 'q3', 'qA'],
  alfabeto: ['a', 'b'],
  alfabetaFita: ['a', 'b', 'X', 'Y', 'B'],
  transicoes: {
    q0: {
      a: { estado: 'q1', escrever: 'X', direcao: 'D' },
      Y: { estado: 'q3', escrever: 'Y', direcao: 'D' },
    },
    q1: {
      a: { estado: 'q1', escrever: 'a', direcao: 'D' },
      Y: { estado: 'q1', escrever: 'Y', direcao: 'D' },
      b: { estado: 'q2', escrever: 'Y', direcao: 'E' },
    },
    q2: {
      a: { estado: 'q2', escrever: 'a', direcao: 'E' },
      Y: { estado: 'q2', escrever: 'Y', direcao: 'E' },
      X: { estado: 'q0', escrever: 'X', direcao: 'D' },
    },
    q3: {
      Y: { estado: 'q3', escrever: 'Y', direcao: 'D' },
      B: { estado: 'qA', escrever: 'B', direcao: 'D' },
    },
    qA: {},
  },
  estadoInicial: 'q0',
  estadosFinais: ['qA'],
  branco: 'B',
}

export const layoutExemploAnBn = {
  q0: { x: 100, y: 250 },
  q1: { x: 260, y: 130 },
  q2: { x: 260, y: 370 },
  q3: { x: 400, y: 250 },
  qA: { x: 520, y: 250 },
}

// L = { aⁿbⁿcⁿ | n ≥ 1 }
// Linguagem não livre de contexto — demonstra o poder das MTs sobre APDs
export const mtExemploAnBnCn = {
  estados: ['q0', 'q1', 'q2', 'q3', 'q4', 'qA'],
  alfabeto: ['a', 'b', 'c'],
  alfabetaFita: ['a', 'b', 'c', 'X', 'Y', 'Z', 'B'],
  transicoes: {
    q0: {
      a: { estado: 'q1', escrever: 'X', direcao: 'D' },
      X: { estado: 'q0', escrever: 'X', direcao: 'D' },
      Y: { estado: 'q4', escrever: 'Y', direcao: 'D' },
    },
    q1: {
      a: { estado: 'q1', escrever: 'a', direcao: 'D' },
      Y: { estado: 'q1', escrever: 'Y', direcao: 'D' },
      b: { estado: 'q2', escrever: 'Y', direcao: 'D' },
    },
    q2: {
      b: { estado: 'q2', escrever: 'b', direcao: 'D' },
      Z: { estado: 'q2', escrever: 'Z', direcao: 'D' },
      c: { estado: 'q3', escrever: 'Z', direcao: 'E' },
    },
    q3: {
      a: { estado: 'q3', escrever: 'a', direcao: 'E' },
      b: { estado: 'q3', escrever: 'b', direcao: 'E' },
      Y: { estado: 'q3', escrever: 'Y', direcao: 'E' },
      Z: { estado: 'q3', escrever: 'Z', direcao: 'E' },
      X: { estado: 'q0', escrever: 'X', direcao: 'D' },
    },
    q4: {
      Y: { estado: 'q4', escrever: 'Y', direcao: 'D' },
      Z: { estado: 'q4', escrever: 'Z', direcao: 'D' },
      B: { estado: 'qA', escrever: 'B', direcao: 'D' },
    },
    qA: {},
  },
  estadoInicial: 'q0',
  estadosFinais: ['qA'],
  branco: 'B',
}

export const layoutExemploAnBnCn = {
  q0: { x: 90,  y: 250 },
  q1: { x: 240, y: 110 },
  q2: { x: 390, y: 110 },
  q3: { x: 315, y: 380 },
  q4: { x: 490, y: 250 },
  qA: { x: 490, y: 110 },
}
