export default function HomePage() {
  const token = localStorage.getItem("token");
  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Willkommen im DevChat!</h2>
      {token ? (
        <>
          <div>Du bist eingeloggt.</div>
          <button onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>Logout</button>
        </>
      ) : (
        <div>Bitte <a href="/login">einloggen</a>.</div>
      )}
    </div>
  );
}
