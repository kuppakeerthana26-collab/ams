import { NavLink } from 'react-router-dom'
import './Header.css'

function Header({ teacher, onLogout }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__brand">
          AMS
        </NavLink>
        <nav aria-label="Main navigation">
          <NavLink to="/">
            Home
          </NavLink>
          {teacher ? (
            <>
              <NavLink to="/dashboard">
                Dashboard
              </NavLink>
              <button type="button" className="primary-link" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="primary-link">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
