import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getChatRooms } from "../api/chatApi";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import CreateGroupChatModal from "../components/CreateGroupChatModal";
import { deleteChatRoom } from "../api/chatApi";


interface Chatroom {
  id: number;
  name?: string;
  displayName?: string;
  isPrivate?: boolean;
  participants?: string[];
}

interface OnlineUser {
  id: string;
  username: string;
}

export default function DashboardPage() {
  const [chatRooms, setChatRooms] = useState<Chatroom[]>([]);
  const [error, setError] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const handleDelete = async (roomId: number) => {
    const token = localStorage.getItem("token");
    try {
      await deleteChatRoom(token!, String(roomId));
      setChatRooms(chatRooms.filter(room => room.id !== roomId));
    } catch (err) {
      setError("Fehler beim Löschen des Chats.");
      console.error("Chat löschen Fehler:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setError("");
    getChatRooms(token!)
      .then(res => {
        setChatRooms(res);
      })
      .catch(err => {
        setError("Fehler beim Laden der Chats.");
        console.error("ChatRooms Fehler:", err);
      });

    // Socket.io Online-User
    const socket = io("http://localhost:4000");
    const userId = localStorage.getItem("userId");
    if (userId) socket.emit("userOnline", userId);
    socket.on("onlineUsers", async (userIds: string[]) => {
      // Hole Userdaten per API
      if (userIds.length === 0) return setOnlineUsers([]);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allUsers = await res.json();
        setOnlineUsers(allUsers.filter((u: OnlineUser) => userIds.includes(u.id)));
      } catch {
        setOnlineUsers([]);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

    const navigate = useNavigate();

  return (
    <>
      <Header />
      <MDBContainer className="my-5">
        <MDBRow>
          <MDBCol md="8">
            <h4>Deine Chats</h4>
            {error && <div style={{ color: "#ED6A5E" }}>{error}</div>}
            <MDBListGroup>
              {chatRooms.map((room: Chatroom) => (
                <MDBListGroupItem key={room.id}>
                  {room.displayName || room.name || room.participants?.join(", ")}
                  <MDBBtn size="sm" className="ms-2" onClick={() => navigate(`/chatroom/${room.id}`)}>Öffnen</MDBBtn>
                  <MDBBtn size="sm" color="danger" className="ms-2" onClick={() => handleDelete(room.id)}>Löschen</MDBBtn>
                </MDBListGroupItem>
              ))}
            </MDBListGroup>
              <MDBBtn className="mt-4 w-100" onClick={() => navigate("/users")}>Neuen Chat starten</MDBBtn>
                <MDBBtn outline color="primary" className="w-100 mt-2" onClick={() => setShowGroupModal(true)}>
                  Gruppenchat erstellen
                </MDBBtn>
                <CreateGroupChatModal open={showGroupModal} setOpen={setShowGroupModal} />
          </MDBCol>
          <MDBCol md="4">
            <h5>Online Users</h5>
            <MDBListGroup>
              {onlineUsers.length === 0 ? (
                <MDBListGroupItem>Niemand online</MDBListGroupItem>
              ) : (
                onlineUsers.map(user => (
                  <MDBListGroupItem key={user.id}>{user.username}</MDBListGroupItem>
                ))
              )}
            </MDBListGroup>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <Footer />
    </>
  );
}


