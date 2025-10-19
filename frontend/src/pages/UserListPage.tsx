import { useEffect, useState } from "react";
import { getAllUsers, startPrivateChat } from "../api/chatApi";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MDBContainer, MDBListGroup, MDBListGroupItem, MDBBtn } from 'mdb-react-ui-kit';

interface User {
  id: string;
  username: string;
  email: string;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");
    
    getAllUsers(token!)
      .then(res => {
        // Exclure l'utilisateur actuel de la liste
        const filteredUsers = res.filter((user: User) => user.id !== currentUserId);
        setUsers(filteredUsers);
      })
      .catch(err => {
        setError("Fehler beim Laden der Nutzer.");
        console.error("UserList Fehler:", err);
      });
  }, []);

    const navigate = useNavigate();

  const handleStartChat = async (userId: string) => {
    const token = localStorage.getItem("token");
    try {
      const chatRoom = await startPrivateChat(token!, userId);
        // Weiterleitung zum ChatRoom mit React Router
        navigate(`/chatroom/${chatRoom.id}`);
    } catch (err) {
      setError("Fehler beim Starten des Chats.");
      console.error("Chat starten Fehler:", err);
    }
  };

  return (
    <>
      <Header />
      <MDBContainer className="my-5">
        <h4>Alle Nutzer</h4>
        {error && <div style={{ color: "#ED6A5E" }}>{error}</div>}
        <MDBListGroup>
          {users.map((user: User) => (
            <MDBListGroupItem key={user.id}>
              {user.username} ({user.email})
              <MDBBtn size="sm" className="ms-2" onClick={() => handleStartChat(user.id)}>
                Chat starten
              </MDBBtn>
            </MDBListGroupItem>
          ))}
        </MDBListGroup>
      </MDBContainer>
      <Footer />
    </>
  );
}
