import { useState } from 'react'
import {
  afdExemploTerminaEm01,
  layoutExemploTerminaEm01,
  afdExemploPar0s,
  layoutExemploPar0s,
} from '../../automata/afd'
import styles from './PainelEdicaoAFD.module.css'

const MODOS = [
  { valor: 'selecionar', rotulo: 'Selecionar' },
  { valor: 'adicionarEstado', rotulo: 'Add. Estado' },
  { valor: 'adicionarTransicao', rotulo: 'Add. Transição' },
  { valor: 'removerEstado', rotulo: 'Rem. Estado' },
]

export default function PainelEdicaoAFD({
  afd,
  setAfd,
  modo,
  setModo,
  setLayout,
  onResetSimulacao,
}) {
  const [exampleSelecionado, setExampleSelecionado] = useState('terminaEm01')

  function handleCarregarExemplo() {
    if (exampleSelecionado === 'terminaEm01') {
      setAfd(afdExemploTerminaEm01)
      setLayout(layoutExemploTerminaEm01)
    } else {
      setAfd(afdExemploPar0s)
      setLayout(layoutExemploPar0s)
    }
    onResetSimulacao()
  }

  function handleLimparTudo() {
    if (!window.confirm('Deseja limpar todos os estados e transições?')) return
    setAfd({
      estados: [],
      alfabeto: [],
      transicoes: {},
      estadoInicial: '',
      estadosFinais: [],
    })
    setLayout({})
    onResetSimulacao()
  }

  function handleAlfabetoBlur(valor) {
    const novos = valor.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setAfd(prev => ({ ...prev, alfabeto: novos }))
  }

  function handleToggleFinal(estado) {
    setAfd(prev => {
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
    setAfd(prev => ({ ...prev, estadoInicial: estado }))
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
          {afd.estados.length === 0 ? (
            <span className={styles.semEstados}>Nenhum estado</span>
          ) : (
            afd.estados.map(estado => (
              <div key={estado} className={styles.itemEstado}>
                <input
                  type="radio"
                  name="estadoInicial"
                  checked={afd.estadoInicial === estado}
                  onChange={() => handleDefinirInicial(estado)}
                  title="Marcar como inicial"
                />
                <input
                  type="checkbox"
                  checked={afd.estadosFinais.includes(estado)}
                  onChange={() => handleToggleFinal(estado)}
                  title="Marcar como final"
                />
                <span className={styles.nomeEstado}>{estado}</span>
              </div>
            ))
          )}
        </div>
        {afd.estados.length > 0 && (
          <div className={styles.dica}>● inicial &nbsp; ☑ final</div>
        )}
      </div>

      {/* Alfabeto */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto</div>
        <input
          key={afd.alfabeto.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={afd.alfabeto.join(', ')}
          onBlur={e => handleAlfabetoBlur(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAlfabetoBlur(e.target.value)}
          placeholder="ex: 0, 1"
        />
        <div className={styles.dica}>Símbolos separados por vírgula</div>
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
            <option value="terminaEm01">Termina em 01</option>
            <option value="par0s">Par de 0s</option>
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
