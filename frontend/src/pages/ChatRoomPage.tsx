import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomMessages, deleteMessage } from "../api/messageApi";
import { getChatRooms } from "../api/chatApi";
import { useChatRoom } from "../hooks/useSocket";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MessageComponent from "../components/MessageComponent";
import ChatInput from "../components/ChatInput";
import { 
  MDBContainer, 
  MDBBtn, 
  MDBIcon, 
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBSpinner,
  MDBBadge
} from 'mdb-react-ui-kit';

import { getChatRoomDisplayName } from "../types";
import type { Message, ChatRoom } from "../types";

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Socket integration
  const { 
    messages: socketMessages, 
    sendMessage: sendSocketMessage, 
    isConnected 
  } = useChatRoom(id || "");

  // ✅ Socket-Messages zu State hinzufügen (Real-time!)
  useEffect(() => {
    socketMessages.forEach(socketMessage => {
      const message: Message = {
        id: socketMessage.id,
        content: socketMessage.content,
        fileUrl: socketMessage.fileUrl,
        fileType: socketMessage.fileType,
        createdAt: new Date(socketMessage.createdAt).toISOString(),
        sender: {
          id: socketMessage.sender.id,
          username: socketMessage.sender.username,
          avatarUrl: socketMessage.sender.avatarUrl
        }
      };

      // Zu Messages hinzufügen (ohne Duplikate)
      setMessages(prev => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        return [...prev, message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });
  }, [socketMessages]);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id || payload.sub || payload.user_id || "");
        console.log('Current user ID from token:', payload.userId || payload.id || payload.sub || payload.user_id);
        console.log('Full token payload:', payload);
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Load initial data
  useEffect(() => {
    if (!id) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(""); // Clear previous errors
        
        // Load chat room info
        const rooms = await getChatRooms();
        const room = rooms.find(r => r.id === id);
        if (!room) {
          setError("ChatRoom nicht gefunden");
          return;
        }
        setChatRoom(room);

        // Load messages
        const messages = await getRoomMessages(id);
        setMessages(Array.isArray(messages) ? messages : []);
        
      } catch (error) {
        console.error('Error loading chat data:', error);
        setError(error instanceof Error ? error.message : 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  // 🔥 FIXED: Auto-scroll with proper dependencies to prevent loops
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]); // Only trigger on message count change

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      
      // Remove from HTTP messages if it exists there
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Note: Socket messages will be handled by real-time updates
      console.log(`✅ Message ${messageId} deleted`);
      
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Fehler beim Löschen der Nachricht');
    }
  };

  // ✅ Nachricht senden - Nur über Socket (kein HTTP-Fallback mehr!)
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !id) return;
    
    const messageContent = content.trim();
    
    try {
      if (!isConnected) {
        setError('Nicht verbunden. Bitte warten...');
        return;
      }

      console.log(`📡 Sending via Socket: ${messageContent.substring(0, 50)}...`);
      sendSocketMessage(messageContent);
      
      // Nachricht wird automatisch via 'messageReceived' Event empfangen!
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Fehler beim Senden der Nachricht');
    }
  };

  // 🔥 FIXED: Handle file upload success without causing loops
  const handleFileUploaded = (messageId: string) => {
    // File uploaded successfully, refresh messages from server
    if (!id) return;
    
    getRoomMessages(id)
      .then(messages => {
        if (Array.isArray(messages)) {
          setMessages(messages);
          console.log(`📎 File uploaded successfully, message ID: ${messageId}`);
        }
      })
      .catch(error => {
        console.error('Error reloading messages after file upload:', error);
        setError('Datei hochgeladen, aber Nachrichten konnten nicht aktualisiert werden');
      });
  };

  // Loading state - Professional MDB Spinner
  if (loading) {
    return (
      <>
        <Header />
        <MDBContainer className="my-5 d-flex justify-content-center">
          <MDBCard className="text-center shadow-3">
            <MDBCardBody>
              <MDBSpinner color="primary" className="mb-3">
                <span className="visually-hidden">Loading...</span>
              </MDBSpinner>
              <h5 className="text-primary">Lade Chat...</h5>
              <p className="text-muted">Nachrichten werden geladen</p>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
        <Footer />
      </>
    );
  }

  // Error state - Professional Bootstrap Alert
  if (error && !chatRoom) {
    return (
      <>
        <Header />
        <MDBContainer className="my-5">
          <div className="alert alert-danger shadow-3" role="alert">
            <h4 className="alert-heading">
              <MDBIcon icon="exclamation-triangle" className="me-2" />
              Fehler!
            </h4>
            <p className="mb-0">{error}</p>
            <hr />
            <div className="d-flex gap-2">
              <MDBBtn color="danger" onClick={() => navigate('/dashboard')}>
                <MDBIcon icon="arrow-left" className="me-1" />
                Zurück zum Dashboard
              </MDBBtn>
              <MDBBtn color="secondary" outline onClick={() => window.location.reload()}>
                <MDBIcon icon="refresh" className="me-1" />
                Erneut versuchen
              </MDBBtn>
            </div>
          </div>
        </MDBContainer>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <MDBContainer className="my-4">
        <MDBCard className="shadow-4 border-0">
          {/* 🎯 Smart Chat Header with Dynamic Title */}
          <MDBCardHeader className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1 text-white">
                  {chatRoom ? getChatRoomDisplayName(chatRoom, currentUserId) : "Chat"}
                </h4>
                <div className="d-flex align-items-center gap-3">
                  <small className="text-white-50">
                    <MDBIcon icon="bi bi-users" className="me-1" />
                    {chatRoom?.participants?.length || 0} Teilnehmer
                  </small>
                  {isConnected ? (
                    <MDBBadge color="success" pill>
                      <MDBIcon icon="bi bi-wifi" className="me-1" />
                      Real-time
                    </MDBBadge>
                  ) : (
                    <MDBBadge color="info" pill>
                      <MDBIcon icon="bi bi-cloud" className="me-1" />
                      HTTP-Modus
                    </MDBBadge>
                  )}
                </div>
              </div>
              <MDBBtn 
                color="light" 
                size="sm"
                className="text-primary"
                onClick={() => navigate('/dashboard')}
              >
                <MDBIcon icon="arrow-left" className="me-1" />
                Zurück
              </MDBBtn>
            </div>
          </MDBCardHeader>

          <MDBCardBody className="p-0">
            {/* Error Display (non-blocking) */}
            {error && chatRoom && (
              <div className="m-3">
                <div className="alert alert-warning alert-dismissible" role="alert">
                  <MDBIcon icon="bi bi-exclamation-triangle" className="me-2" />
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError("")}
                    aria-label="Close"
                  ></button>
                </div>
              </div>
            )}

            {/* 🔥 IMPROVED: Messages Container with MDB Styling */}
            <div 
              className="position-relative overflow-auto"
              style={{ 
                backgroundColor: "#f8f9fa",
                minHeight: "500px",
                maxHeight: "60vh",
                borderBottom: "1px solid #dee2e6"
              }}
            >
              <div className="p-3">
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <MDBIcon icon="bi bi-chat" size="3x" className="mb-3 text-primary opacity-50" />
                    <h5 className="text-muted">Noch keine Nachrichten</h5>
                    <p className="text-muted">Schreibe die erste Nachricht!</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((message) => (
                      <MessageComponent
                        key={message.id}
                        message={message}
                        isCurrentUser={message.sender.id === currentUserId}
                        onDelete={handleDeleteMessage}
                        showAvatar={true}
                      />
                    ))}
                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Chat Input - Nur aktiv wenn Socket verbunden */}
            <div className="p-3 bg-white border-top">
              <ChatInput
                onSendMessage={handleSendMessage}
                onFileUploaded={handleFileUploaded}
                disabled={!isConnected}
                chatRoomId={id || ""}
                placeholder={isConnected ? "Nachricht eingeben..." : "Warte auf Verbindung..."}
              />
              {!isConnected && (
                <small className="text-warning d-block mt-2">
                  <MDBIcon icon="exclamation-triangle" className="me-1" />
                  Verbindung wird hergestellt...
                </small>
              )}
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
      <Footer />
    </>
  );
}