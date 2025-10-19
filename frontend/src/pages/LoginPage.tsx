import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBIcon,
  MDBCheckbox
}
from 'mdb-react-ui-kit';
import DevChatImage from "../assets/DevChatLogo.png"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import '../styles/LoginPage.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


    // Nettoyer les anciens tokens lors de l'accès à la page de login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Nettoyer automatiquement si l'utilisateur accède à la page de login
      // (cela signifie probablement que son token a expiré)
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      console.log("Anciens tokens nettoyés lors de l'accès à la page de login");
    }
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      // Token et informations utilisateur stocker
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);
      console.log("Login successful, user data stored.", data.user);
      if (data.token) navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
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
              <img src={DevChatImage}
                style={{width: '185px'}} alt="logo" />
              <h4 className="mt-1 mb-5 pb-1">We are The Lotus Team</h4>
            </div>

            <p>Please login to your account</p>


            <form onSubmit={handleLogin}>
              <MDBInput
                wrapperClass='mb-4'
                label='Email address'
                id='form1'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Password'
                id='form2'
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <div className="d-flex justify-content-between mx-4 mb-4">
                <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                <a href="!#">Forgot password?</a>
              </div>
              {error && <div style={{ color: "#ED6A5E", textAlign: "center" }}>{error}</div>}
              <MDBBtn className="mb-2 w-100 gradient-custom-2" type="submit" disabled={loading}>
                {loading ? "Wird eingeloggt..." : "Sign in"}
              </MDBBtn>
            </form>

            <div className="divider d-flex align-items-center my-2">
                <div className="w-100 d-flex align-items-center justify-content-center">
                  <p className="text-center fw-bold mx-2 mb-0">OR</p>
                </div>
            </div>

            <MDBBtn className="mb-4 w-100" size="lg" style={{backgroundColor: '#dd4b39', color: '#fff'}} onClick={() => window.location.href = "http://localhost:4000/api/auth/google-oauth"}>
                <MDBIcon fab icon="bi bi-google" className="mx-2" style={{color: '#fff'}} />
                Continue with Google
            </MDBBtn>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Don't have an account?</p>
              <MDBBtn outline className='mx-2' color='danger' onClick={() => navigate("/register")}>
                Sign Up
              </MDBBtn>
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
          Copyright © 2025. All rights reserved.
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
}

export default LoginPage;