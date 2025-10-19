import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getChatMessages, sendMessage, sendFileMessage } from "../api/chatApi";
import { deleteMessage } from "../api/messageApi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MDBContainer, MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';
import { io } from "socket.io-client";

type Message = {
  id: string;
  sender?: {
    username?: string;
  };
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt?: string;
};

export default function ChatRoomPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [chatTitle, setChatTitle] = useState("Chat");
  // Get current user's username from localStorage (adjust key as needed)
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    getChatMessages(token!, id)
      .then(res => {
        setMessages(res);
        // Définir le titre du chat basé sur les participants
        if (res.length > 0) {
          const otherUsers = res
            .map((msg: Message) => msg.sender?.username)
            .filter((name: string | undefined) => name && name !== username)
            .filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index); // unique
          
          if (otherUsers.length > 0) {
            setChatTitle(otherUsers.length === 1 ? otherUsers[0] : `Groupe (${otherUsers.length + 1})`);
          }
        }
      })
      .catch(err => {
        setError("Fehler beim Laden der Nachrichten.");
        console.error("ChatRoom Fehler:", err);
      });

    // Socket.io für Echtzeit-Nachrichten
    const socket = io("http://localhost:4000");
    socket.emit("joinRoom", id);
    
    socket.on("receiveMessage", (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      socket.emit("leaveRoom", id);
      socket.disconnect();
    };
  }, [id, username]);

  const handleSend = async () => {
    const token = localStorage.getItem("token");
    if (!id || !token) return;
    try {
      if (file) {
        await sendFileMessage(token, id, file);
        setFile(null);
        setNewMsg("");
      } else if (newMsg.trim()) {
        await sendMessage(token, id, newMsg);
        setNewMsg("");
      } else {
        return;
      }
      // Nachricht wird über Socket.io automatisch empfangen, keine manuelle Aktualisierung nötig
    } catch (err) {
      setError("Fehler beim Senden der Nachricht.");
      console.error("Nachricht senden Fehler:", err);
    }
  };

  const [file, setFile] = useState<File | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_UR || "http://localhost:4000";

  // Fonction pour formater l'heure
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };  return (
    <>
      <Header />
      <MDBContainer className="my-5" style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <h4 className="mb-3">💬 {chatTitle}</h4>
        {error && <div style={{ color: "#ED6A5E", marginBottom: "10px" }}>{error}</div>}
        
        {/* Chat Messages Container */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto", 
          background: "#f8f9fa", 
          borderRadius: "10px", 
          padding: "15px", 
          marginBottom: "15px",
          maxHeight: "500px"
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6c757d", padding: "20px" }}>
              Keine Nachrichten vorhanden. Starte die Unterhaltung! 🚀
            </div>
          ) : (
            messages.map((msg: Message) => {
              const isOwnMessage = msg.sender?.username === username;
              const senderInitial = msg.sender?.username?.charAt(0).toUpperCase() || "?";
              
              return (
                <div 
                  key={msg.id} 
                  style={{ 
                    display: "flex", 
                    justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    marginBottom: "12px",
                    gap: "8px"
                  }}
                >
                  {/* Avatar pour les messages reçus */}
                  {!isOwnMessage && (
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#007bff",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8em",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}>
                      {senderInitial}
                    </div>
                  )}
                  <div style={{
                    background: isOwnMessage ? "#007bff" : "white",
                    color: isOwnMessage ? "white" : "black",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    maxWidth: "70%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    position: "relative",
                    marginLeft: isOwnMessage ? "0" : "8px",
                    marginRight: isOwnMessage ? "8px" : "0"
                  }}>
                    {/* Nom de l'expéditeur pour les messages reçus */}
                    {!isOwnMessage && (
                      <div style={{ 
                        fontSize: "0.75em", 
                        fontWeight: "bold", 
                        marginBottom: "4px", 
                        opacity: 0.8,
                        color: "#007bff"
                      }}>
                        {msg.sender?.username || "Inconnu"}
                      </div>
                    )}
                    
                    {/* Contenu du message */}
                    <div style={{ marginBottom: "4px" }}>{msg.content}</div>
                    
                    {/* Heure d'envoi */}
                    <div style={{ 
                      fontSize: "0.7em", 
                      opacity: 0.7, 
                      textAlign: isOwnMessage ? "right" : "left",
                      marginTop: "4px"
                    }}>
                      {formatTime(msg.createdAt)}
                    </div>
                    
                    {/* Datei-Anhang */}
                    {msg.fileUrl && (
                      <div style={{ marginTop: "8px" }}>
                        <a 
                          href={`${backendUrl}${msg.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: isOwnMessage ? "#cce7ff" : "#007bff",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <MDBIcon fas icon="bi bi-download" size="sm" />
                          Datei herunterladen
                        </a>
                        {msg.fileType?.startsWith("image/") && (
                          <div style={{ marginTop: "8px" }}>
                            <img 
                              src={`${backendUrl}${msg.fileUrl}`} 
                              alt="Datei" 
                              style={{ 
                                maxWidth: "200px", 
                                borderRadius: "8px",
                                border: "1px solid rgba(255,255,255,0.3)"
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    )}
              
                    {/* Löschen-Button für eigene Nachrichten - EINFACH UND FUNKTIONAL */}
                    {isOwnMessage && (
                      <button 
                        style={{ 
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 10,
                          opacity: 0.8
                        }}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const token = localStorage.getItem("token");
                            if (token) {
                              await deleteMessage(token, msg.id);
                              setMessages(prev => prev.filter(m => m.id !== msg.id));
                            }
                          } catch (error) {
                            console.error("Fehler beim Löschen:", error);
                            setError("Fehler beim Löschen der Nachricht");
                          }
                        }}
                        title="Nachricht löschen"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Avatar pour les messages envoyés */}
                  {isOwnMessage && (
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#28a745",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8em",
                      fontWeight: "bold",
                      flexShrink: 0
                    }}>
                      {username.charAt(0).toUpperCase() || "M"}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="d-flex mt-3 align-items-center gap-2" style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px", border: "1px solid #dee2e6" }}>
          <MDBInput
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Nachricht schreiben..."
            style={{ flex: 1, border: "none", background: "white" }}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          
          {/* Verstecktes File Input */}
          <input 
            type="file" 
            id="fileInput"
            onChange={e => setFile(e.target.files?.[0] || null)} 
            style={{ display: 'none' }} 
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
          
          {/* File Upload Button mit Icon */}
          <MDBBtn 
            color="light" 
            size="sm" 
            className="border-0" 
            onClick={() => document.getElementById('fileInput')?.click()}
            title="Datei anhängen"
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
          >
            <MDBIcon fas icon="bi bi-paperclip" />
          </MDBBtn>
          
          <MDBBtn 
            color="primary" 
            size="sm" 
            onClick={handleSend} 
            disabled={(!newMsg.trim() && !file)}
            title={file ? "Datei senden" : "Nachricht senden"}
            style={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0
            }}
          >
            <MDBIcon 
              fas 
              icon={file ? "bi-file-earmark-arrow-up" : "bi bi-send"} 
              style={{ fontSize: "1.2rem" }} 
            />
          </MDBBtn>
          
          {/* Anzeige der ausgewählten Datei */}
          {file && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              background: "#e3f2fd", 
              padding: "8px 12px", 
              borderRadius: "8px", 
              marginLeft: "10px",
              border: "1px solid #2196f3"
            }}>
              <MDBIcon fas icon="paperclip" size="sm" style={{ color: "#2196f3", marginRight: "8px" }} />
              <span style={{ color: "#1976d2", fontSize: "0.9em", marginRight: "8px" }}>
                {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Datei entfernen"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </MDBContainer>
      <Footer />
    </>
  );
}
