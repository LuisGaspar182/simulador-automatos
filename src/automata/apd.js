// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null
export function validarEntrada(apd, entrada) {
  for (const simbolo of entrada) {
    if (!apd.alfabeto.includes(simbolo)) return simbolo
  }
  return null
}

// Executa a simulação passo a passo de um APD
// Formato do passo: { estado, pilha, posicao, simboloConsumido }
// Último passo também tem 'aceito' (bool) ou 'erro' (string)
//
// Convenção da pilha: pilha[length-1] = topo
// Convenção de empilhar: primeiro char da string fica no topo após a operação
export function simular(apd, entrada) {
  const MAX_PASSOS = 500

  let estado = apd.estadoInicial
  let pos = 0
  const pilha = [apd.simboloInicial]

  const passos = [{
    estado,
    pilha: [...pilha],
    posicao: 0,
    simboloConsumido: null,
  }]

  for (let iter = 0; iter < MAX_PASSOS; iter++) {
    const topo = pilha[pilha.length - 1]

    if (topo === undefined) {
      passos[passos.length - 1].erro = 'Pilha esvaziada sem transição disponível'
      return passos
    }

    const simAtual = pos < entrada.length ? entrada[pos] : null

    // Transição ε tem prioridade: é o que garante o determinismo quando ambas existiriam
    const transEps = apd.transicoes[estado]?.['ε,' + topo]
    const transInput = simAtual !== null ? apd.transicoes[estado]?.[simAtual + ',' + topo] : null
    const trans = transEps ?? transInput
    const consumiu = !transEps && !!transInput

    if (!trans) {
      const ultimo = passos[passos.length - 1]
      if (pos >= entrada.length) {
        ultimo.aceito = apd.estadosFinais.includes(estado)
      } else {
        ultimo.erro = `Sem transição de '${estado}' com '${simAtual}' e topo '${topo}'`
      }
      return passos
    }

    pilha.pop()
    const pushStr = trans.empilhar ?? ''
    // Empilha da direita para a esquerda para que o primeiro char fique no topo
    for (let i = pushStr.length - 1; i >= 0; i--) {
      pilha.push(pushStr[i])
    }

    if (consumiu) pos++
    estado = trans.estado

    passos.push({
      estado,
      pilha: [...pilha],
      posicao: pos,
      simboloConsumido: consumiu ? entrada[pos - 1] : null,
    })
  }

  passos[passos.length - 1].erro = 'Limite de passos atingido (possível loop infinito na pilha)'
  return passos
}

// L = { a^n b^n | n >= 1 }
// Empilha um A para cada 'a' lido, desempilha um A para cada 'b' lido
export const apdExemploAnBn = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['a', 'b'],
  alfabetoPilha: ['A', 'Z'],
  transicoes: {
    q0: {
      'a,Z': { estado: 'q0', empilhar: 'AZ' },
      'a,A': { estado: 'q0', empilhar: 'AA' },
      'b,A': { estado: 'q1', empilhar: '' },
    },
    q1: {
      'b,A': { estado: 'q1', empilhar: '' },
      'ε,Z': { estado: 'q2', empilhar: 'Z' },
    },
    q2: {},
  },
  estadoInicial: 'q0',
  simboloInicial: 'Z',
  estadosFinais: ['q2'],
}

export const layoutExemploAnBn = {
  q0: { x: 120, y: 250 },
  q1: { x: 320, y: 250 },
  q2: { x: 520, y: 250 },
}

// L = { wcw^R | w ∈ {a,b}* } — palíndromos com marcador central 'c'
// Fase q0: empilha os símbolos de w
// Fase q1: desempilha conferindo com w^R
// Fase q2: aceita (apenas Z restante na pilha)
export const apdExemploPalindromo = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['a', 'b', 'c'],
  alfabetoPilha: ['A', 'B', 'Z'],
  transicoes: {
    q0: {
      'a,Z': { estado: 'q0', empilhar: 'AZ' },
      'a,A': { estado: 'q0', empilhar: 'AA' },
      'a,B': { estado: 'q0', empilhar: 'AB' },
      'b,Z': { estado: 'q0', empilhar: 'BZ' },
      'b,A': { estado: 'q0', empilhar: 'BA' },
      'b,B': { estado: 'q0', empilhar: 'BB' },
      'c,Z': { estado: 'q1', empilhar: 'Z' },
      'c,A': { estado: 'q1', empilhar: 'A' },
      'c,B': { estado: 'q1', empilhar: 'B' },
    },
    q1: {
      'a,A': { estado: 'q1', empilhar: '' },
      'b,B': { estado: 'q1', empilhar: '' },
      'ε,Z': { estado: 'q2', empilhar: 'Z' },
    },
    q2: {},
  },
  estadoInicial: 'q0',
  simboloInicial: 'Z',
  estadosFinais: ['q2'],
}

export const layoutExemploPalindromo = {
  q0: { x: 120, y: 250 },
  q1: { x: 340, y: 250 },
  q2: { x: 560, y: 250 },
}
