import { useState } from 'react'
import {
  afndExemplopenultimo1, layoutExemplopenultimo1,
  afndExemplodivisivelpor2ou3, layoutExemplodivisivelpor2ou3,
} from '../../automata/afnd'
import styles from './PainelEdicaoAFND.module.css'

const MODOS = [
  { valor: 'selecionar', rotulo: 'Selecionar' },
  { valor: 'adicionarEstado', rotulo: 'Add. Estado' },
  { valor: 'adicionarTransicao', rotulo: 'Add. Transição' },
  { valor: 'removerEstado', rotulo: 'Rem. Estado' },
]

export default function PainelEdicaoAFND({
  afnd,
  setAfnd,
  modo,
  setModo,
  setLayout,
  onResetSimulacao,
}) {
  const [exampleSelecionado, setExampleSelecionado] = useState('penultimo1')

  function handleCarregarExemplo() {
    if (exampleSelecionado === 'penultimo1') {
      setAfnd(afndExemplopenultimo1)
      setLayout(layoutExemplopenultimo1)
    } else {
      setAfnd(afndExemplodivisivelpor2ou3)
      setLayout(layoutExemplodivisivelpor2ou3)
    }
    onResetSimulacao()
  }

  function handleLimparTudo() {
    if (!window.confirm('Deseja limpar todos os estados e transições?')) return
    setAfnd({
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
    setAfnd(prev => ({ ...prev, alfabeto: novos }))
  }

  function handleToggleFinal(estado) {
    setAfnd(prev => {
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
    setAfnd(prev => ({ ...prev, estadoInicial: estado }))
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
          {afnd.estados.length === 0 ? (
            <span className={styles.semEstados}>Nenhum estado</span>
          ) : (
            afnd.estados.map(estado => (
              <div key={estado} className={styles.itemEstado}>
                <input
                  type="radio"
                  name="estadoInicial"
                  checked={afnd.estadoInicial === estado}
                  onChange={() => handleDefinirInicial(estado)}
                  title="Marcar como inicial"
                />
                <input
                  type="checkbox"
                  checked={afnd.estadosFinais.includes(estado)}
                  onChange={() => handleToggleFinal(estado)}
                  title="Marcar como final"
                />
                <span className={styles.nomeEstado}>{estado}</span>
              </div>
            ))
          )}
        </div>
        {afnd.estados.length > 0 && (
          <div className={styles.dica}>● inicial &nbsp; ☑ final</div>
        )}
      </div>

      {/* Alfabeto */}
      <div className={styles.secao}>
        <div className={styles.secaoTitulo}>Alfabeto</div>
        <input
          key={afnd.alfabeto.join(',')}
          className={styles.inputAlfabeto}
          type="text"
          defaultValue={afnd.alfabeto.join(', ')}
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
            <option value="penultimo1">Penúltimo símbolo é 1</option>
            <option value="divisivelpor2ou3">Divisível por 2 ou 3</option>
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
