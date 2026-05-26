import { useState } from 'react'
import {
  apdExemploAnBn, layoutExemploAnBn,
  apdExemploPalindromo, layoutExemploPalindromo,
} from '../../automata/apd'
import styles from './PainelEdicaoAPD.module.css'

const MODOS = [
  { valor: 'selecionar', rotulo: 'Selecionar' },
  { valor: 'adicionarEstado', rotulo: 'Add. Estado' },
  { valor: 'adicionarTransicao', rotulo: 'Add. Transição' },
  { valor: 'removerEstado', rotulo: 'Rem. Estado' },
]

export default function PainelEdicaoAPD({
  apd,
  setApd,
  modo,
  setModo,
  setLayout,
  onResetSimulacao,
  onRemoverTransicao,
}) {
  const [exampleSelecionado, setExampleSelecionado] = useState('anBn')

  function handleCarregarExemplo() {
    if (exampleSelecionado === 'anBn') {
      setApd(apdExemploAnBn)
      setLayout(layoutExemploAnBn)
    } else {
      setApd(apdExemploPalindromo)
      setLayout(layoutExemploPalindromo)
    }
    onResetSimulacao()
  }

  function handleLimparTudo() {
    if (!window.confirm('Deseja limpar todos os estados e transições?')) return
    setApd({
      estados: [],
      alfabeto: [],
      alfabetoPilha: [],
      transicoes: {},
      estadoInicial: '',
      simboloInicial: '',
      estadosFinais: [],
    })
    setLayout({})
    onResetSimulacao()
  }

  function handleAlfabetoBlur(valor) {
    const novos = valor.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setApd(prev => ({ ...prev, alfabeto: novos }))
  }

  function handleAlfabetoPilhaBlur(valor) {
    const novos = valor.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setApd(prev => ({ ...prev, alfabetoPilha: novos }))
  }

  function handleSimboloInicialBlur(valor) {
    setApd(prev => ({ ...prev, simboloInicial: valor.trim() }))
  }

  function handleToggleFinal(estado) {
    setApd(prev => {
      const eFinal = prev.estadosFinais.includes(estado)
      return {
        ...prev,
        estadosFinais: eFinal
          ? prev.estadosFinais.filter(e => e !== estado)
          : [...prev.estadosFinais, estado],
      }
    })
  }

  function handleDefinirInicial(estado) {
    setApd(prev => ({ ...prev, estadoInicial: estado }))
  }

  // Monta a lista de todas as transições para exibição no painel
  // Formato: δ(origem, símbolo, topo) = (destino, empilhar)
  const todasTransicoes = []
  for (const [origem, trans] of Object.entries(apd.transicoes)) {
    for (const [chave, resultado] of Object.entries(trans)) {
      const [simbolo, topo] = chave.split(',')
      const emp = resultado.empilhar === '' ? 'ε' : resultado.empilhar
      todasTransicoes.push({
        origem,
        chave,
        rotulo: `δ(${origem},${simbolo},${topo})=(${resultado.estado},${emp})`,
      })
    }
  }

  return (
    <div className={styles.painel}>
      {/* Modo de interação */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Modo</div>
        <div className={styles.modos}>
          {MODOS.map(({ valor, rotulo }) => (
            <button
              key={valor}
              className={`${styles.botaoModo} ${modo === valor ? styles.botaoModoAtivo : ''}`}
              onClick={() => setModo(valor)}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de estados com controles de inicial/final */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Estados</div>
        <div className={styles.listaEstados}>
          {apd.estados.length === 0 ? (
            <span className={styles.semEstados}>Nenhum estado</span>
          ) : (
            apd.estados.map(estado => (
              <div key={estado} className={styles.itemEstado}>
                <input
                  type="radio"
                  name="estadoInicial"
                  checked={apd.estadoInicial === estado}
                  onChange={() => handleDefinirInicial(estado)}
                  title="Marcar como inicial"
                />
                <input
                  type="checkbox"
                  checked={apd.estadosFinais.includes(estado)}
                  onChange={() => handleToggleFinal(estado)}
                  title="Marcar como final"
                />
                <span className={styles.nomeEstado}>{estado}</span>
              </div>
            ))
          )}
        </div>
        {apd.estados.length > 0 && (
          <div className={styles.dica}>● inicial &nbsp; ☑ final</div>
        )}
      </div>

      {/* Alfabeto de entrada */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto de Entrada</div>
        <input
          key={apd.alfabeto.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={apd.alfabeto.join(', ')}
          onBlur={e => handleAlfabetoBlur(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAlfabetoBlur(e.target.value)}
          placeholder="ex: a, b"
        />
        <div className={styles.dica}>Símbolos separados por vírgula</div>
      </div>

      {/* Alfabeto da pilha + símbolo inicial */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto da Pilha</div>
        <input
          key={apd.alfabetoPilha.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={apd.alfabetoPilha.join(', ')}
          onBlur={e => handleAlfabetoPilhaBlur(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAlfabetoPilhaBlur(e.target.value)}
          placeholder="ex: A, Z"
        />
        <div className={styles.linhaSimInicial}>
          <span className={styles.dicaInline}>Símbolo inicial:</span>
          <input
            key={apd.simboloInicial}
            className={styles.inputSimInicial}
            type="text"
            defaultValue={apd.simboloInicial}
            onBlur={e => handleSimboloInicialBlur(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSimboloInicialBlur(e.target.value)}
            placeholder="Z"
          />
        </div>
      </div>

      {/* Lista de transições com opção de remoção individual */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Transições</div>
        <div className={styles.listaTransicoes}>
          {todasTransicoes.length === 0 ? (
            <span className={styles.semEstados}>Nenhuma transição</span>
          ) : (
            todasTransicoes.map(({ origem, chave, rotulo }) => (
              <div key={`${origem}-${chave}`} className={styles.itemTransicao}>
                <span className={styles.rotuloTransicao}>{rotulo}</span>
                <button
                  className={styles.botaoRemover}
                  onClick={() => onRemoverTransicao(origem, chave)}
                  title="Remover esta transição"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exemplos pré-definidos */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Exemplos</div>
        <div className={styles.linhaExemplo}>
          <select
            className={styles.selectExemplo}
            value={exampleSelecionado}
            onChange={e => setExampleSelecionado(e.target.value)}
          >
            <option value="anBn">L = aⁿbⁿ (n ≥ 1)</option>
            <option value="palindromo">L = wcwᴿ</option>
          </select>
          <button className={styles.botaoAcao} onClick={handleCarregarExemplo}>
            Carregar
          </button>
        </div>
      </div>

      {/* Ações destrutivas */}
      <div className={styles.secao}>
        <button className={styles.botaoPerigo} onClick={handleLimparTudo}>
          Limpar tudo
        </button>
      </div>
    </div>
  )
}
