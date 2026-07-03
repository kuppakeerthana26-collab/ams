import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage({ teacher }) {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">Attendance Monitoring System</p>
          <h1>Track classes, teachers, and attendance from one simple place.</h1>
          <p className="home-hero__text">
            AMS helps teachers sign in securely, connect with their assigned
            class, and prepare the system for daily attendance monitoring.
          </p>
          <div className="home-actions">
            {teacher ? (
              <Link to="/dashboard">
                Open Dashboard
              </Link>
            ) : (
              <Link to="/login">
                Login to AMS
              </Link>
            )}
          </div>
        </div>

        <div className="attendance-preview" aria-label="Attendance overview">
          <div className="attendance-preview__top">
            <span>Today</span>
            <strong>{teacher ? teacher.assignedClass.branch : 'Class'}</strong>
          </div>
          <div className="attendance-preview__stat">
            <span>Assigned Teacher</span>
            <strong>{teacher ? teacher.name : 'Login required'}</strong>
          </div>
          <div className="attendance-list">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div>
          <p className="eyebrow">About</p>
          <h2>Built for classroom attendance workflows</h2>
        </div>
        <p>
          This frontend connects to the existing AMS server. Teachers can
          register with a secret code, verify their email with an OTP, log in,
          and see their assigned class details after authentication.
        </p>
      </section>

      <section className="steps-section">
        <div className="section-heading">
          <p className="eyebrow">How to use</p>
          <h2>Get started in three steps</h2>
        </div>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Create a teacher account</h3>
            <p>
              Enter your name, email, password, assigned class, section, year,
              and the secret code provided by the admin.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Verify OTP</h3>
            <p>
              Submit the OTP sent to your email to complete registration and
              securely create your teacher profile.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>Login and manage class</h3>
            <p>
              Use your email and password to log in. AMS will show your assigned
              class details from the server.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default HomePage
