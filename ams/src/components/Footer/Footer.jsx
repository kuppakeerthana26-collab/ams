import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>AMS</p>
        <p>&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default Footer
