import { useState } from 'react'
import {
  mtExemploAnBn, layoutExemploAnBn,
  mtExemploAnBnCn, layoutExemploAnBnCn,
} from '../../automata/mt'
import styles from './PainelEdicaoMT.module.css'

const MODOS = [
  { valor: 'selecionar',        rotulo: 'Selecionar' },
  { valor: 'adicionarEstado',   rotulo: 'Add. Estado' },
  { valor: 'adicionarTransicao', rotulo: 'Add. Transição' },
  { valor: 'removerEstado',     rotulo: 'Rem. Estado' },
]

export default function PainelEdicaoMT({
  mt,
  setMt,
  modo,
  setModo,
  setLayout,
  onResetSimulacao,
  onRemoverTransicao,
}) {
  const [exampleSelecionado, setExampleSelecionado] = useState('anBn')

  function handleCarregarExemplo() {
    if (exampleSelecionado === 'anBn') {
      setMt(mtExemploAnBn)
      setLayout(layoutExemploAnBn)
    } else {
      setMt(mtExemploAnBnCn)
      setLayout(layoutExemploAnBnCn)
    }
    onResetSimulacao()
  }

  function handleLimparTudo() {
    if (!window.confirm('Deseja limpar todos os estados e transições?')) return
    setMt({
      estados: [],
      alfabeto: [],
      alfabetaFita: [],
      transicoes: {},
      estadoInicial: '',
      estadosFinais: [],
      branco: 'B',
    })
    setLayout({})
    onResetSimulacao()
  }

  function handleAlfabetoBlur(valor) {
    const novos = valor.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setMt(prev => ({ ...prev, alfabeto: novos }))
  }

  function handleAlfabetaFitaBlur(valor) {
    const novos = valor.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setMt(prev => ({ ...prev, alfabetaFita: novos }))
  }

  function handleBrancoBlur(valor) {
    setMt(prev => ({ ...prev, branco: valor.trim() || 'B' }))
  }

  function handleToggleFinal(estado) {
    setMt(prev => {
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
    setMt(prev => ({ ...prev, estadoInicial: estado }))
  }

  // Monta a lista de todas as transições
  // Formato: δ(origem, lido) = (destino, escrito, dir)
  const todasTransicoes = []
  for (const [origem, trans] of Object.entries(mt.transicoes)) {
    for (const [lido, resultado] of Object.entries(trans)) {
      todasTransicoes.push({
        origem,
        lido,
        rotulo: `δ(${origem},${lido})=(${resultado.estado},${resultado.escrever},${resultado.direcao})`,
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

      {/* Lista de estados */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Estados</div>
        <div className={styles.listaEstados}>
          {mt.estados.length === 0 ? (
            <span className={styles.semEstados}>Nenhum estado</span>
          ) : (
            mt.estados.map(estado => (
              <div key={estado} className={styles.itemEstado}>
                <input
                  type="radio"
                  name="estadoInicial"
                  checked={mt.estadoInicial === estado}
                  onChange={() => handleDefinirInicial(estado)}
                  title="Marcar como inicial"
                />
                <input
                  type="checkbox"
                  checked={mt.estadosFinais.includes(estado)}
                  onChange={() => handleToggleFinal(estado)}
                  title="Marcar como final (aceitação)"
                />
                <span className={styles.nomeEstado}>{estado}</span>
              </div>
            ))
          )}
        </div>
        {mt.estados.length > 0 && (
          <div className={styles.dica}>● inicial &nbsp; ☑ aceitação</div>
        )}
      </div>

      {/* Alfabeto de entrada */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto de Entrada (Σ)</div>
        <input
          key={mt.alfabeto.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={mt.alfabeto.join(', ')}
          onBlur={e => handleAlfabetoBlur(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAlfabetoBlur(e.target.value)}
          placeholder="ex: a, b"
        />
        <div className={styles.dica}>Símbolos separados por vírgula</div>
      </div>

      {/* Alfabeto da fita */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto de Fita (Γ)</div>
        <input
          key={mt.alfabetaFita.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={mt.alfabetaFita.join(', ')}
          onBlur={e => handleAlfabetaFitaBlur(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAlfabetaFitaBlur(e.target.value)}
          placeholder="ex: a, b, X, B"
        />
        <div className={styles.linhaSimInicial}>
          <span className={styles.dicaInline}>Símbolo branco:</span>
          <input
            key={mt.branco}
            className={styles.inputSimInicial}
            type="text"
            defaultValue={mt.branco}
            onBlur={e => handleBrancoBlur(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBrancoBlur(e.target.value)}
            placeholder="B"
          />
        </div>
      </div>

      {/* Lista de transições */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Transições</div>
        <div className={styles.listaTransicoes}>
          {todasTransicoes.length === 0 ? (
            <span className={styles.semEstados}>Nenhuma transição</span>
          ) : (
            todasTransicoes.map(({ origem, lido, rotulo }) => (
              <div key={`${origem}-${lido}`} className={styles.itemTransicao}>
                <span className={styles.rotuloTransicao}>{rotulo}</span>
                <button
                  className={styles.botaoRemover}
                  onClick={() => onRemoverTransicao(origem, lido)}
                  title="Remover esta transição"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exemplos */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Exemplos</div>
        <div className={styles.linhaExemplo}>
          <select
            className={styles.selectExemplo}
            value={exampleSelecionado}
            onChange={e => setExampleSelecionado(e.target.value)}
          >
            <option value="anBn">L = aⁿbⁿ (n ≥ 1)</option>
            <option value="anBnCn">L = aⁿbⁿcⁿ (n ≥ 1)</option>
          </select>
          <button className={styles.botaoAcao} onClick={handleCarregarExemplo}>
            Carregar
          </button>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.secao}>
        <button className={styles.botaoPerigo} onClick={handleLimparTudo}>
          Limpar tudo
        </button>
      </div>
    </div>
  )
}
