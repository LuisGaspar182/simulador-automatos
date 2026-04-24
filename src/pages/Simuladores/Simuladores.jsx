import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import styles from './Simuladores.module.css'

const simuladores = [
  { label: 'Autômato Finito Determinístico', rota: '/afd' },
  { label: 'Autômato Finito Não Determinístico', rota: '/afnd' },
  { label: 'Autômato de Pilha Determinístico', rota: '/apd' },
  { label: 'Autômato de Pilha Não Determinístico', rota: '/apnd' },
  { label: 'Máquinas de Turing', rota: '/turing' },
]

export default function Simuladores() {
  return (
    <Layout>
      <div className={styles.centro}>
        <div className={styles.card}>
          <h1 className={styles.titulo}>Simulador de Autômatos</h1>
          <nav className={styles.lista}>
            {simuladores.map(({ label, rota }) => (
              <Link key={rota} to={rota} className={styles.botao}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </Layout>
  )
}
