import AuthForm from '../components/AuthForm'

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Connexion / Inscription</h2>
      <AuthForm />
    </div>
  )
}