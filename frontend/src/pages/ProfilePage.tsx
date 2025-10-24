import ChangePasswordModal from "../components/ChangePasswordModal";
import AvatarSelector from "../components/AvatarSelector";
import AvatarComponent from "../components/AvatarComponent";
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from 'mdb-react-ui-kit';
import { useState, useEffect } from "react";
import DevChatImage from "../assets/DevChatLogo.png";
import { getProfile, updateProfile } from "../api/profileApi";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const [semester, setSemester] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setError("Nicht eingeloggt.");
    getProfile(token)
      .then(res => {
        setSemester(res.semester || "");
        setUsername(res.username || "");
        setEmail(res.email || "");
        setAvatarUrl(res.avatarUrl);
        console.log(res.avatarUrl);
      })
      .catch((err) => {
        console.error("Profil-Fehler:", err);
        setError("Profil konnte nicht geladen werden.");
      });
  }, []);
  
  /**
   * Avatar-Auswahl Handler
   */
  const handleAvatarSelected = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    setSuccess("Avatar erfolgreich ausgewählt!");
    setError("");
    console.log("Neuer Avatar ausgewählt:", newAvatarUrl);
  };

  /**
   * Avatar-Selector öffnen
   */
  const openAvatarSelector = () => {
    setShowAvatarSelector(true);
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
              {/* Avatar Anzeige und Auswahl */}
              <div className="mb-4 text-center">
                <div className="mb-3">
                  <AvatarComponent 
                    src={avatarUrl}
                    username={username || "User"}
                    size="large"
                    className="mx-auto mb-2"
                  />
                </div>
                
                <MDBBtn 
                  color="primary" 
                  size="sm" 
                  onClick={openAvatarSelector}
                  disabled={loading}
                >
                  Avatar ändern
                </MDBBtn>
                
                <p className="text-muted small mt-2">
                  Wähle aus unseren vorgefertigten Avataren
                </p>
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
                
                {/* Password Change Modal */}
                <ChangePasswordModal open={showPasswordModal} setOpen={setShowPasswordModal} />
                
                {/* Avatar Selector Modal */}
                <AvatarSelector
                  isOpen={showAvatarSelector}
                  onClose={() => setShowAvatarSelector(false)}
                  onAvatarSelected={handleAvatarSelected}
                  currentAvatarUrl={avatarUrl}
                />
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
