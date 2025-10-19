import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBIcon,
} from 'mdb-react-ui-kit';
import DevChatImage from "../assets/DevChatLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/authApi";
import '../styles/RegisterPage.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ label: string; color: string }>({ label: "", color: "#2D3748" });
  // Passwortstärke prüfen
  const checkPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Sehr schwach", color: "#B44593" };
    if (score === 3) return { label: "Schwach", color: "#ED6A5E" };
    if (score === 4) return { label: "Gut", color: "#3182CE" };
    if (score === 5) return { label: "Sehr stark", color: "#2C7A7B" };
    return { label: "", color: "#2D3748" };
  };

  // Passwortänderung mit Stärkeprüfung
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setPassword(pw);
    setPasswordStrength(checkPasswordStrength(pw));
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerApi(username, email, password);
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Serverfehler");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column ms-5">
            <div className="text-center">
              <img src={DevChatImage} style={{width: '185px'}} alt="logo" />
              <h4 className="mt-1 mb-5 pb-1">DevChat Registrierung</h4>
            </div>
            <p>Bitte registriere dich für einen neuen Account</p>
            <form onSubmit={handleSubmit}>
              <MDBInput
                wrapperClass='mb-4'
                label='Benutzername'
                id='formUsername'
                type='text'
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Email address'
                id='formEmail'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Password'
                id='formPassword'
                type='password'
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {password && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 500, color: passwordStrength.color }}>
                    Passwortstärke: {passwordStrength.label}
                  </div>
                  <ul style={{ fontSize: 13, margin: 0, paddingLeft: 18, color: '#2D3748' }}>
                    <li style={{ textDecoration: password.length >= 8 ? 'line-through' : 'none' }}>Mindestens 8 Zeichen</li>
                    <li style={{ textDecoration: /[A-Z]/.test(password) ? 'line-through' : 'none' }}>Großbuchstaben</li>
                    <li style={{ textDecoration: /[a-z]/.test(password) ? 'line-through' : 'none' }}>Kleinbuchstaben</li>
                    <li style={{ textDecoration: /[0-9]/.test(password) ? 'line-through' : 'none' }}>Zahlen</li>
                    <li style={{ textDecoration: /[^A-Za-z0-9]/.test(password) ? 'line-through' : 'none' }}>Sonderzeichen</li>
                  </ul>
                </div>
              )}
              {error && <div style={{ color: "#ED6A5E", textAlign: "center" }}>{error}</div>}
              <MDBBtn className="mb-2 w-100 gradient-custom-2" type="submit" disabled={loading}>
                {loading ? "Wird registriert..." : "Registrieren"}
              </MDBBtn>
              <div className="divider d-flex align-items-center my-2">
                <div className="w-100 d-flex align-items-center justify-content-center">
                  <p className="text-center fw-bold mx-2 mb-0">OR</p>
                </div>
              </div>
              <MDBBtn
                className="mb-4 w-100"
                size="lg"
                style={{ backgroundColor: '#dd4b39', color: '#fff' }}
                onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api'}/auth/google-oauth`}
              >
                <MDBIcon fab icon="bi bi-google" className="mx-2" style={{ color: '#fff' }} />
                Mit Google registrieren
              </MDBBtn>
            </form>
            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Bereits registriert?</p>
              <MDBBtn outline className='mx-2' color='primary' onClick={() => navigate("/login")}>Login</MDBBtn>
            </div>
          </div>
        </MDBCol>
        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column  justify-content-center gradient-custom-2 h-100 mb-4">
            <div className="text-white px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">DevChat für Entwickler</h4>
              <p className="small mb-0">
                Diese Chat-App ist speziell für Informatikstudenten der Hochschule Darmstadt entwickelt. Vernetze dich, tausche dich aus und finde Unterstützung rund um dein Studium!
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
      <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
        <div className="text-white mb-3 mb-md-0">
          Copyright © 2020. All rights reserved.
        </div>
        <div>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
            <MDBIcon fab icon='bi bi-facebook' size="lg"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='bi bi-twitter' size="lg"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='bi bi-google' size="lg"/>
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white'  }}>
            <MDBIcon fab icon='bi bi-linkedin' size="lg"/>
          </MDBBtn>
        </div>
      </div>
    </MDBContainer>
  );
};

export default RegisterPage;
