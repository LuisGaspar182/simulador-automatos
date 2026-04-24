import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import styles from './Home.module.css'

export default function Home() {
  return (
    <Layout>
      <div className={styles.centro}>
        <div className={styles.card}>
          <h1 className={styles.titulo}>Simulador de Autômatos</h1>
          <p className={styles.descricao}>
            Ferramenta educacional para simulação de autômatos e máquinas de Turing.
          </p>
          <div className={styles.botoes}>
            <Link to="/simuladores" className={styles.botao}>
              Simuladores
            </Link>
            <Link to="/conteudo" className={styles.botao}>
              Conteúdo Teórico
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
