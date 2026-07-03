import { useState } from 'react'
import LoginForm from '../../components/LoginForm/LoginForm.jsx'
import Message from '../../components/Message/Message.jsx'
import TeacherCard from '../../components/TeacherCard/TeacherCard.jsx'
import { loginTeacher } from '../../services/authService.js'
import './AuthPage.css'

const initialLogin = {
  email: '',
  password: '',
}

function AuthPage({ teacher, onAuthenticated, onLogout }) {
  const [loginForm, setLoginForm] = useState(initialLogin)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const updateLogin = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const data = await loginTeacher(loginForm)
      setMessage(data.message)

      if (data.success) {
        onAuthenticated(data)
        setLoginForm(initialLogin)
      }
    } catch {
      setMessage('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p>Teacher access</p>
        <h1>Login to AMS</h1>
      </section>

      <Message text={message} />
      <TeacherCard teacher={teacher} onLogout={onLogout} />

      <div className="auth-grid">
        <div className="auth-form-shell">
          <LoginForm
            form={loginForm}
            onChange={updateLogin}
            loading={loading}
            onSubmit={handleLogin}
          />
        </div>
      </div>
    </main>
  )
}

export default AuthPage
