import { MDBNavbar, MDBContainer, MDBNavbarNav, MDBNavbarItem, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import DevChatImage from '../assets/DevChatLogo.png';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  let title = "DevChat";
  if (location.pathname === "/profile") title = "Profil";
  if (location.pathname === "/") title = "Home";
  if (location.pathname === "/login") title = "Login";

  return (
    <MDBNavbar style={{ background: "linear-gradient(90deg, #2C7A7B 0%, #ED6A5E 100%)", boxShadow: "0 2px 8px rgba(44,122,123,0.15)" }} dark expand='lg'>
      <MDBContainer fluid className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => navigate("/") }>
          <img src={DevChatImage} alt="logo" height="48" style={{ marginRight: 16, borderRadius: 12, boxShadow: "0 2px 8px #ED6A5E55" }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 2, textShadow: "0 2px 8px #2C7A7B55" }}>{title}</span>
        </div>
        <MDBNavbarNav right fullWidth={false} className='mb-2 mb-lg-0 d-flex flex-row gap-2'>
          <MDBNavbarItem>
            <MDBBtn color="light" rounded size="sm" onClick={() => navigate("/profile") } style={{ fontWeight: 500 }}>
              <MDBIcon icon="user" className="me-2" /> Profil
            </MDBBtn>
          </MDBNavbarItem>
          <MDBNavbarItem>
            <MDBBtn color="light" rounded size="sm" onClick={() => navigate("/") } style={{ fontWeight: 500 }}>
              <MDBIcon icon="comments" className="me-2" /> Home
            </MDBBtn>
          </MDBNavbarItem>
          <MDBNavbarItem>
            <MDBBtn color="danger" rounded size="sm" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} style={{ fontWeight: 500 }}>
              <MDBIcon icon="sign-out-alt" className="me-2" /> Logout
            </MDBBtn>
          </MDBNavbarItem>
        </MDBNavbarNav>
      </MDBContainer>
    </MDBNavbar>
  );
}
