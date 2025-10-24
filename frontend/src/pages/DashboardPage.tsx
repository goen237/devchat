import { useEffect, useState } from "react";
import { getChatRooms, deleteChatRoom, getAllUsers } from "../api/chatApi";
import type { ChatRoom, User } from "../types";
import { getAvatarUrl, getChatRoomDisplayName } from "../types";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useSocket, useUserStatus } from "../hooks/useSocket";
import { 
  MDBContainer, 
  MDBRow, 
  MDBCol, 
  MDBBtn, 
  MDBListGroup, 
  MDBListGroupItem,
  MDBIcon,
  MDBBadge,
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCardImage
} from 'mdb-react-ui-kit';
import CreateGroupChatModal from "../components/CreateGroupChatModal";

export default function DashboardPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [error, setError] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  
  const navigate = useNavigate();
  
  // 🔌 Socket.io Verbindung für Online-Status
  useSocket(); // Initialisiert Socket-Verbindung
  const { onlineUsers, isUserOnline } = useUserStatus();

  // 🔥 FIXED: Current User ID aus JWT Token extrahieren
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id || payload.sub || payload.user_id || "");
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleDelete = async (roomId: string) => {
    try {
      await deleteChatRoom(roomId);
      setChatRooms(chatRooms.filter(room => room.id !== roomId));
    } catch (err) {
      setError("Fehler beim Löschen des Chats.");
      console.error("Chat löschen Fehler:", err);
    }
  };

  useEffect(() => {
    setError("");
    getChatRooms()
      .then(res => {
        setChatRooms(res);
      })
      .catch(err => {
        setError("Fehler beim Laden der Chats.");
        console.error("ChatRooms Fehler:", err);
      });
    
    // Alle Users laden für Online-Status
    getAllUsers()
      .then(users => {
        setAllUsers(users);
      })
      .catch(err => {
        console.error("Users Fehler:", err);
      });
  }, []);

  return (
    <>
      <Header />
      <MDBContainer className="my-5">
        <MDBRow>
          <MDBCol md="8">
            {/* 🎯 IMPROVED: Professional Chat List mit Smart Titles */}
            <MDBCard className="shadow-4">
              <MDBCardHeader className="bg-primary text-white">
                <h4 className="mb-0 text-white">
                  <MDBIcon icon="bi bi-comments" className="me-2" />
                  Deine Chats
                </h4>
              </MDBCardHeader>
              <MDBCardBody className="p-0">
                {error && (
                  <div className="alert alert-danger m-3 mb-0">{error}</div>
                )}
                
                {chatRooms.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <MDBIcon icon="bi bi-comments" size="3x" className="mb-3 text-primary opacity-50" />
                    <h5 className="text-muted">Noch keine Chats</h5>
                    <p className="text-muted">Starte deinen ersten Chat!</p>
                  </div>
                ) : (
                  <MDBListGroup flush>
                    {chatRooms.map((room: ChatRoom) => (                      <MDBListGroupItem key={room.id} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {room.type === 'private' ? (
                              // <MDBIcon icon="bi bi-person" className="text-success" size="lg" />
                              <MDBCardImage
                                src={getAvatarUrl(room.participants.find(p => p.id !== currentUserId)?.avatarUrl ?? '')}
                                alt={getChatRoomDisplayName(room, currentUserId)}
                                className="rounded-circle"
                                style={{ width: '40px', height: '40px' }}
                              />
                            ) : (
                              <MDBIcon icon="bi bi-people" className="text-primary" size="lg" />
                            )}
                          </div>
                          <div>
                            <div className="fw-bold">
                              {getChatRoomDisplayName(room, currentUserId)}
                            </div>
                            <small className="text-muted">
                              {room.participants?.length || 0} Teilnehmer
                              {room.type === 'private' && (
                                <MDBBadge color="success" pill className="ms-2">Privat</MDBBadge>
                              )}
                              {room.type === 'group' && (
                                <MDBBadge color="primary" pill className="ms-2">Gruppe</MDBBadge>
                              )}
                            </small>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <MDBBtn 
                            size="sm" 
                            color="primary"
                            onClick={() => navigate(`/chatroom/${room.id}`)}
                          >
                            <MDBIcon icon="bi bi-comments" className="me-1" />
                            Öffnen
                          </MDBBtn>
                          <MDBBtn 
                            size="sm" 
                            color="danger" 
                            floating
                            onClick={() => handleDelete(room.id)}
                            title="Chat löschen"
                          >
                            <MDBIcon icon="bi bi-trash" />
                          </MDBBtn>
                        </div>
                      </MDBListGroupItem>
                    ))}
                  </MDBListGroup>
                )}
                
                <div className="p-3 border-top bg-light">
                  <MDBBtn 
                    color="primary" 
                    className="w-100 mb-2" 
                    onClick={() => navigate("/users")}
                  >
                    <MDBIcon icon="bi bi-plus" className="me-2" />
                    Neuen Chat starten
                  </MDBBtn>
                  <MDBBtn 
                    outline 
                    color="primary" 
                    className="w-100" 
                    onClick={() => setShowGroupModal(true)}
                  >
                    <MDBIcon icon="bi bi-person-plus" className="me-2" />
                    Gruppenchat erstellen
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
            
            <CreateGroupChatModal open={showGroupModal} setOpen={setShowGroupModal} />
          </MDBCol>
          
          <MDBCol md="4">
            {/* Online Users Card */}
            <MDBCard className="shadow-4">
              <MDBCardHeader className="bg-success text-white">
                <h5 className="mb-0 text-white">
                  <MDBIcon fas icon="bi bi-circle" className="me-2" style={{ fontSize: '0.6rem' }} />
                  Online Users
                  <MDBBadge color="light" className="ms-2">
                    {onlineUsers.size}
                  </MDBBadge>
                </h5>
              </MDBCardHeader>
              <MDBCardBody className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {onlineUsers.size === 0 ? (
                  <MDBListGroup flush>
                    <MDBListGroupItem className="text-center text-muted py-3">
                      <MDBIcon fas icon="bi bi-user-slash" className="mb-2" />
                      <br />
                      Keine User online
                    </MDBListGroupItem>
                  </MDBListGroup>
                ) : (
                  <MDBListGroup flush>
                    {allUsers
                      .filter(user => isUserOnline(user.id) && user.id !== currentUserId)
                      .map(user => (
                        <MDBListGroupItem 
                          key={user.id}
                          className="d-flex align-items-center py-2 px-3"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/users`)}
                          action
                        >
                          <div className="position-relative me-2">
                            {user.avatarUrl ? (
                              <MDBCardImage 
                                src={getAvatarUrl(user.avatarUrl)} 
                                alt={user.username}
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%', 
                                  objectFit: 'cover' 
                                }}
                              />
                            ) : (
                              <div 
                                className="bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '50%', 
                                  fontSize: '1.2rem', 
                                  fontWeight: 'bold' 
                                }}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span 
                              className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                              style={{ 
                                width: '12px', 
                                height: '12px' 
                              }}
                            ></span>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{user.username}</div>
                            {user.semester && (
                              <small className="text-muted">
                                {user.semester}. Semester
                              </small>
                            )}
                          </div>
                          <MDBIcon fas icon="bi bi-chat" className="text-primary" />
                        </MDBListGroupItem>
                      ))}
                  </MDBListGroup>
                )}
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <Footer />
    </>
  );
}


