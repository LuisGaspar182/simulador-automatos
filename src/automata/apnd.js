// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null
export function validarEntrada(apnd, entrada) {
  for (const simbolo of entrada) {
    if (!apnd.alfabeto.includes(simbolo)) return simbolo
  }
  return null
}

const MAX_CONFIGS = 200
const MAX_PASSOS = 200
const MAX_PROFUNDIDADE_EPS = 500

// ε-closure: expande um conjunto de configurações usando transições ε
function epsClosure(apnd, configs) {
  const visited = new Set(configs.map(c => c.estado + '|' + c.pilha.join(',')))
  const fila = [...configs]
  const resultado = [...configs]
  let prof = 0

  while (fila.length > 0 && prof < MAX_PROFUNDIDADE_EPS) {
    prof++
    const cfg = fila.shift()
    const topo = cfg.pilha[cfg.pilha.length - 1]
    if (topo === undefined) continue

    const trans = apnd.transicoes[cfg.estado]?.['ε,' + topo] ?? []
    for (const t of trans) {
      const novaPilha = [...cfg.pilha.slice(0, -1)]
      const emp = t.empilhar ?? ''
      for (let i = emp.length - 1; i >= 0; i--) novaPilha.push(emp[i])

      const novoEstado = t.estado
      const key = novoEstado + '|' + novaPilha.join(',')
      if (!visited.has(key)) {
        visited.add(key)
        const nova = { estado: novoEstado, pilha: novaPilha }
        resultado.push(nova)
        fila.push(nova)
      }
    }
  }

  return resultado
}

// Simula o APND retornando array de passos.
// Cada passo: { ramos: [{estado, pilha}], posicao, simboloConsumido }
// Último passo tem também 'aceito' (bool)
export function simular(apnd, entrada) {
  let configs = epsClosure(apnd, [{ estado: apnd.estadoInicial, pilha: [apnd.simboloInicial] }])
  let pos = 0

  const passos = [{
    ramos: configs.map(c => ({ estado: c.estado, pilha: [...c.pilha] })),
    posicao: 0,
    simboloConsumido: null,
  }]

  while (pos < entrada.length && configs.length > 0 && passos.length < MAX_PASSOS) {
    const sim = entrada[pos]
    const novosConfigs = []
    const visited = new Set()

    for (const cfg of configs) {
      const topo = cfg.pilha[cfg.pilha.length - 1]
      if (topo === undefined) continue

      const trans = apnd.transicoes[cfg.estado]?.[sim + ',' + topo] ?? []
      for (const t of trans) {
        const novaPilha = [...cfg.pilha.slice(0, -1)]
        const emp = t.empilhar ?? ''
        for (let i = emp.length - 1; i >= 0; i--) novaPilha.push(emp[i])

        const novoEstado = t.estado
        const key = novoEstado + '|' + novaPilha.join(',')
        if (!visited.has(key)) {
          visited.add(key)
          novosConfigs.push({ estado: novoEstado, pilha: novaPilha })
        }
      }
    }

    pos++
    configs = epsClosure(apnd, novosConfigs)
    if (configs.length > MAX_CONFIGS) configs = configs.slice(0, MAX_CONFIGS)

    passos.push({
      ramos: configs.map(c => ({ estado: c.estado, pilha: [...c.pilha] })),
      posicao: pos,
      simboloConsumido: sim,
    })
  }

  const ultimo = passos[passos.length - 1]
  ultimo.aceito = configs.some(c => apnd.estadosFinais.includes(c.estado))

  return passos
}

// L = { aⁿbⁿ | n ≥ 1 }
export const apndExemploAnBn = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['a', 'b'],
  alfabetoPilha: ['A', 'Z'],
  transicoes: {
    q0: {
      'a,Z': [{ estado: 'q0', empilhar: 'AZ' }],
      'a,A': [{ estado: 'q0', empilhar: 'AA' }],
      'b,A': [{ estado: 'q1', empilhar: '' }],
    },
    q1: {
      'b,A': [{ estado: 'q1', empilhar: '' }],
      'ε,Z': [{ estado: 'q2', empilhar: 'Z' }],
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

// L = { ww^R | w ∈ {a,b}* } — palíndromos sem marcador central
// Fase q0: empilha símbolos; via ε transita não-deterministicamente para q1 (adivinha o meio)
// Fase q1: desempilha conferindo com a segunda metade
// q2: estado de aceitação (quando restou apenas Z na pilha)
export const apndExemploPalindromo = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['a', 'b'],
  alfabetoPilha: ['A', 'B', 'Z'],
  transicoes: {
    q0: {
      'a,Z': [{ estado: 'q0', empilhar: 'AZ' }],
      'a,A': [{ estado: 'q0', empilhar: 'AA' }],
      'a,B': [{ estado: 'q0', empilhar: 'AB' }],
      'b,Z': [{ estado: 'q0', empilhar: 'BZ' }],
      'b,A': [{ estado: 'q0', empilhar: 'BA' }],
      'b,B': [{ estado: 'q0', empilhar: 'BB' }],
      'ε,Z': [{ estado: 'q1', empilhar: 'Z' }],
      'ε,A': [{ estado: 'q1', empilhar: 'A' }],
      'ε,B': [{ estado: 'q1', empilhar: 'B' }],
    },
    q1: {
      'a,A': [{ estado: 'q1', empilhar: '' }],
      'b,B': [{ estado: 'q1', empilhar: '' }],
      'ε,Z': [{ estado: 'q2', empilhar: 'Z' }],
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
