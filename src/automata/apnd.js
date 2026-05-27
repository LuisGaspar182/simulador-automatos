// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null
export function validarEntrada(apnd, entrada) {
  for (const simbolo of entrada) {
    if (!apnd.alfabeto.includes(simbolo)) return simbolo
  }
  return null
}

// Executa a simulação passo a passo de um APND usando BFS de configurações
//
// Estrutura de transições do APND:
//   transicoes[estado]['sim,topo'] = [ { estado: destino, empilhar: str }, ... ]
//
// Cada passo retornado:
//   { ramos: [ { estado, pilha } ], posicao, simboloConsumido }
// Último passo também tem 'aceito' (bool)
//
// Convenção da pilha: pilha[length-1] = topo
export function simular(apnd, entrada) {
  const MAX_CONFIGS = 200          // limite de configurações simultâneas
  const MAX_PROFUNDIDADE = 60      // limite de altura da pilha
  const MAX_PASSOS_EPS = 300       // limite de iterações do ε-fecho

  function serializarConfig({ estado, pilha }) {
    return `${estado}|${pilha.join(',')}`
  }

  // Aplica todas as ε-transições transitivamente a partir de um conjunto de configurações
  function epsilonFecho(configs) {
    const resultado = new Map()
    const fila = []

    for (const cfg of configs) {
      const key = serializarConfig(cfg)
      if (!resultado.has(key)) {
        resultado.set(key, cfg)
        fila.push(cfg)
      }
    }

    let iter = 0
    while (fila.length > 0 && iter < MAX_PASSOS_EPS) {
      iter++
      const cfg = fila.shift()
      const topo = cfg.pilha[cfg.pilha.length - 1]
      if (topo === undefined) continue

      const transEps = apnd.transicoes[cfg.estado]?.['ε,' + topo] ?? []

      for (const trans of transEps) {
        const novaPilha = cfg.pilha.slice(0, -1)
        for (let i = trans.empilhar.length - 1; i >= 0; i--) {
          novaPilha.push(trans.empilhar[i])
        }
        if (novaPilha.length > MAX_PROFUNDIDADE) continue

        const novaCfg = { estado: trans.estado, pilha: novaPilha }
        const key = serializarConfig(novaCfg)
        if (!resultado.has(key) && resultado.size < MAX_CONFIGS) {
          resultado.set(key, novaCfg)
          fila.push(novaCfg)
        }
      }
    }

    return [...resultado.values()]
  }

  // Configuração inicial + ε-fecho
  const configInicial = [{ estado: apnd.estadoInicial, pilha: [apnd.simboloInicial] }]
  let configsAtuais = epsilonFecho(configInicial)

  const passos = [{
    ramos: configsAtuais.map(c => ({ estado: c.estado, pilha: [...c.pilha] })),
    posicao: 0,
    simboloConsumido: null,
  }]

  for (let i = 0; i < entrada.length; i++) {
    const sim = entrada[i]
    const proxConfigs = new Map()

    for (const cfg of configsAtuais) {
      const topo = cfg.pilha[cfg.pilha.length - 1]
      if (topo === undefined) continue

      const trans = apnd.transicoes[cfg.estado]?.[sim + ',' + topo] ?? []

      for (const t of trans) {
        const novaPilha = cfg.pilha.slice(0, -1)
        for (let j = t.empilhar.length - 1; j >= 0; j--) {
          novaPilha.push(t.empilhar[j])
        }
        if (novaPilha.length > MAX_PROFUNDIDADE) continue

        const novaCfg = { estado: t.estado, pilha: novaPilha }
        const key = serializarConfig(novaCfg)
        if (!proxConfigs.has(key)) {
          proxConfigs.set(key, novaCfg)
        }
      }
    }

    configsAtuais = epsilonFecho([...proxConfigs.values()])

    const passo = {
      ramos: configsAtuais.map(c => ({ estado: c.estado, pilha: [...c.pilha] })),
      posicao: i + 1,
      simboloConsumido: sim,
    }

    passos.push(passo)

    if (configsAtuais.length === 0) {
      passos[passos.length - 1].aceito = false
      return passos
    }
  }

  // Aceita se pelo menos um ramo termina em estado final
  const aceito = configsAtuais.some(cfg => apnd.estadosFinais.includes(cfg.estado))
  passos[passos.length - 1].aceito = aceito

  return passos
}

// ─── Exemplos ─────────────────────────────────────────────────────────────────

// L = { a^n b^n | n >= 0 } — versão APND com ε-transição não-determinística
// q0: lê a's empilhando A; adivinha não-deterministicamente quando terminaram
// q1: lê b's desempilhando A
// q2: estado final
export const apndExemploAnBn = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['a', 'b'],
  alfabetoPilha: ['A', 'Z'],
  transicoes: {
    q0: {
      'a,Z': [{ estado: 'q0', empilhar: 'AZ' }],
      'a,A': [{ estado: 'q0', empilhar: 'AA' }],
      'ε,A': [{ estado: 'q1', empilhar: 'A' }],
      'ε,Z': [{ estado: 'q1', empilhar: 'Z' }],
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
  q1: { x: 340, y: 250 },
  q2: { x: 560, y: 250 },
}

// L = { ww^R | w ∈ {a,b}* } — palíndromos de comprimento par
// Exemplo CLÁSSICO que exige não-determinismo: o autômato "adivinha" o ponto médio
// q0: empilha símbolos de w (fase 1)
// q1: desempilha conferindo com w^R (fase 2) — transição ε-não-determinística de q0 para q1
// q2: estado final
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

/*
 * Testes manuais:
 *
 * apndExemploAnBn (L = a^n b^n):
 *   Aceitar: '' (vazio), 'ab', 'aabb', 'aaabbb'
 *   Rejeitar: 'a', 'b', 'ba', 'aab', 'abb'
 *
 * apndExemploPalindromo (L = ww^R):
 *   Aceitar: '' (vazio), 'aa', 'bb', 'abba', 'baab', 'aabbaa'
 *   Rejeitar: 'a', 'ab', 'abc', 'aba'
 */
