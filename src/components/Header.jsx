import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <header className={styles.header}>
      <span className={styles.marca}>Simulador de Autômatos</span>
      <button
        className={styles.hamburger}
        onClick={() => setMenuAberto(v => !v)}
        aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
      >
        {menuAberto ? '✕' : '☰'}
      </button>
      <nav className={`${styles.nav} ${menuAberto ? styles.navAberto : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => isActive ? styles.ativo : undefined}
          onClick={() => setMenuAberto(false)}
        >
          Home
        </NavLink>
        <NavLink
          to="/simuladores"
          className={({ isActive }) => isActive ? styles.ativo : undefined}
          onClick={() => setMenuAberto(false)}
        >
          Simuladores
        </NavLink>
        <NavLink
          to="/conteudo"
          className={({ isActive }) => isActive ? styles.ativo : undefined}
          onClick={() => setMenuAberto(false)}
        >
          Conteúdo
        </NavLink>
      </nav>
    </header>
  )
}
