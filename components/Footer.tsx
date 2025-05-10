export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 1rem',
      background: '#111',
      color: '#fff',
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <span>&copy; {new Date().getFullYear()} StreamFlow. Tous droits réservés.</span>
    </footer>
  )
}