import './LoginForm.css'

function LoginForm({ form, loading, onChange, onSubmit }) {
  return (
    <section className="auth-panel">
      <h2>Login</h2>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          Login
        </button>
      </form>
    </section>
  )
}

export default LoginForm
