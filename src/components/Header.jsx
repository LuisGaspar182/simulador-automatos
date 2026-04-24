import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.marca}>Simulador de Autômatos</span>
      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.ativo : undefined}>
          Home
        </NavLink>
        <NavLink to="/simuladores" className={({ isActive }) => isActive ? styles.ativo : undefined}>
          Simuladores
        </NavLink>
        <NavLink to="/conteudo" className={({ isActive }) => isActive ? styles.ativo : undefined}>
          Conteúdo
        </NavLink>
      </nav>
    </header>
  )
}
