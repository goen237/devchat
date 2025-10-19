import ChangePasswordModal from "../components/ChangePasswordModal";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from 'mdb-react-ui-kit';
import { useState, useEffect } from "react";
import DevChatImage from "../assets/DevChatLogo.png";
import { getProfile, updateProfile, uploadAvatar } from "../api/profileApi";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const [semester, setSemester] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Nicht eingeloggt.");
    getProfile(token)
      .then(res => {
        setSemester(res.semester || "");
        setUsername(res.username || "");
        setEmail(res.email || "");
        setAvatarUrl(res.avatarUrl);
      })
      .catch((err) => {
        console.error("Profil-Fehler:", err);
        setError("Profil konnte nicht geladen werden.");
      });
  }, []);
  
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await uploadAvatar(token!, avatarFile);
      setAvatarUrl(res.avatarUrl);
      setSuccess("Avatar erfolgreich hochgeladen!");
      setAvatarFile(null);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Fehler beim Hochladen des Avatars.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await updateProfile(token!, {
        username,
        email,
        semester: Number(semester)
      });
      console.log("Profil gespeichert:", res);
      setSuccess("Profil erfolgreich aktualisiert!");
    } catch (err) {
      console.error("Profil speichern Fehler:", err);
      setError("Fehler beim Speichern.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <MDBContainer className="my-5 gradient-form">
        <MDBRow>
          <MDBCol col='6' className="mb-5">
            <div className="d-flex flex-column ms-5">
              <div className="text-center">
                <img src={DevChatImage} style={{width: '185px'}} alt="logo" />
                <h4 className="mt-1 mb-5 pb-1">Profil bearbeiten</h4>
              </div>
              {/* Avatar Anzeige und Upload */}
              <div className="mb-4 text-center">
                {avatarUrl ? (
                  <img src={`http://localhost:4000${avatarUrl}`} alt="Avatar" style={{ width: 100, borderRadius: "50%", marginBottom: 8 }} />
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#eee", display: "inline-block", marginBottom: 8 }} />
                )}
                <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                <MDBBtn size="sm" className="ms-2" onClick={handleAvatarUpload} disabled={!avatarFile || loading}>
                  {loading ? "Hochladen..." : "Avatar hochladen"}
                </MDBBtn>
              </div>
              <form onSubmit={handleSave}>
                <MDBInput
                  wrapperClass='mb-4'
                  label='Username'
                  id='formUsername'
                  type='text'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass='mb-4'
                  label='Email'
                  id='formEmail'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass='mb-4'
                  label='Semester'
                  id='formSemester'
                  type='number'
                  min={1}
                  max={20}
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  required
                />
                {error && <div style={{ color: "#ED6A5E", textAlign: "center" }}>{error}</div>}
                {success && <div style={{ color: "#2C7A7B", textAlign: "center" }}>{success}</div>}
                <MDBBtn className="mb-2 w-100 gradient-custom-2" type="submit" disabled={loading}>
                  {loading ? "Speichern..." : "Speichern"}
                </MDBBtn>
            
              </form>
              <MDBBtn outline color="primary" className="w-100 mb-2" onClick={() => setShowPasswordModal(true)}>
                  Passwort ändern
                </MDBBtn>
                <ChangePasswordModal open={showPasswordModal} setOpen={setShowPasswordModal} />
            </div>
          </MDBCol>
          <MDBCol col='6' className="mb-5">
            <div className="d-flex flex-column justify-content-center gradient-custom-2 h-100 mb-4">
              <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                <h4 className="mb-4">Dein DevChat Profil</h4>
                <p className="small mb-0">
                  Hier kannst du dein Semester angeben oder ändern. So finden dich Kommilitonen aus deinem Studienjahr leichter!
                </p>
              </div>
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <Footer />
    </>
  );
}
