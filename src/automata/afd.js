// Retorna o primeiro símbolo da entrada que não pertence ao alfabeto, ou null se todos são válidos
export function validarEntrada(afd, entrada) {
  for (const simbolo of entrada) {
    if (!afd.alfabeto.includes(simbolo)) return simbolo;
  }
  return null;
}

// Executa a simulação do AFD na entrada e retorna a sequência de passos
export function simular(afd, entrada) {
  const passoInicial = { estado: afd.estadoInicial, posicao: 0, simboloConsumido: null };

  const simboloInvalido = validarEntrada(afd, entrada);
  if (simboloInvalido !== null) {
    return [
      passoInicial,
      {
        estado: null,
        posicao: 0,
        simboloConsumido: simboloInvalido,
        erro: `Símbolo '${simboloInvalido}' não pertence ao alfabeto`,
      },
    ];
  }

  const passos = [passoInicial];
  let estadoAtual = afd.estadoInicial;

  for (let i = 0; i < entrada.length; i++) {
    const simbolo = entrada[i];
    const transicaoEstado = afd.transicoes[estadoAtual];

    if (!transicaoEstado || !(simbolo in transicaoEstado)) {
      passos.push({
        estado: null,
        posicao: i,
        simboloConsumido: simbolo,
        erro: `Sem transição de '${estadoAtual}' com símbolo '${simbolo}'`,
      });
      return passos;
    }

    estadoAtual = transicaoEstado[simbolo];
    passos.push({ estado: estadoAtual, posicao: i + 1, simboloConsumido: simbolo });
  }

  passos[passos.length - 1].aceito = afd.estadosFinais.includes(estadoAtual);
  return passos;
}

// AFD que aceita strings binárias terminando em "01"
// q0: inicial (não leu nada relevante), q1: leu "0", q2: leu "01" (final)
export const afdExemploTerminaEm01 = {
  estados: ['q0', 'q1', 'q2'],
  alfabeto: ['0', '1'],
  transicoes: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q1', '1': 'q2' },
    q2: { '0': 'q1', '1': 'q0' },
  },
  estadoInicial: 'q0',
  estadosFinais: ['q2'],
};

export const layoutExemploTerminaEm01 = {
  q0: { x: 120, y: 250 },
  q1: { x: 320, y: 250 },
  q2: { x: 520, y: 250 },
};

// AFD que aceita strings binárias com número par de zeros
// q0: par de 0s (inicial, final), q1: ímpar de 0s
export const afdExemploPar0s = {
  estados: ['q0', 'q1'],
  alfabeto: ['0', '1'],
  transicoes: {
    q0: { '0': 'q1', '1': 'q0' },
    q1: { '0': 'q0', '1': 'q1' },
  },
  estadoInicial: 'q0',
  estadosFinais: ['q0'],
};

export const layoutExemploPar0s = {
  q0: { x: 180, y: 250 },
  q1: { x: 420, y: 250 },
};

/*
 * Testes manuais:
 *
 * afdExemploTerminaEm01 (aceita strings binárias que terminam em 01):
 *   Aceitar: '01', '101', '001', '11101'
 *   Rejeitar: '0', '1', '10', '11', '010', '' (vazio)
 *
 * afdExemploPar0s (aceita strings binárias com número par de zeros):
 *   Aceitar: '' (vazio), '1', '11', '00', '100', '0011'
 *   Rejeitar: '0', '10', '0001'
 */
