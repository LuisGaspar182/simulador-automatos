import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.conteudo}>{children}</main>
      <Footer />
    </div>
  )
}
