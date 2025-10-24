import React from 'react';
import { 
  MDBIcon, 
  MDBBtn, 
  MDBBadge,
  MDBCard,
  MDBCardBody 
} from 'mdb-react-ui-kit';
import type { Message } from '../types/message.types';
import { getFileUrl, getFileType, extractFilenameFromUrl, getAvatarUrl } from '../types/message.types';

/**
 * Message Component - Einzelne Nachricht anzeigen
 * 
 * Features:
 * - Text-Nachrichten
 * - Datei-Nachrichten mit Download/Preview
 * - Avatar-Anzeige
 * - Zeitstempel
 * - Responsive Design mit Bootstrap
 */

interface MessageComponentProps {
  message: Message;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
  showAvatar?: boolean;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  isCurrentUser,
  onDelete,
  showAvatar = true
}) => {
  
  // Debug logging
  console.log('MessageComponent received message:', {
    id: message.id,
    content: message.content?.substring(0, 50),
    sender: message.sender,
    isCurrentUser
  });
  
  /**
   * Avatar-Komponente mit MDB Design
   */
  const Avatar = () => {
    if (!showAvatar) return null;

    const avatarSize = "40px";
    const avatarStyle = {
      width: avatarSize,
      height: avatarSize,
      borderRadius: "50%",
      objectFit: "cover" as const,
      border: "2px solid #e0e0e0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    };

    const fallbackStyle = {
      width: avatarSize,
      height: avatarSize,
      borderRadius: "50%",
      backgroundColor: isCurrentUser ? "#1976d2" : "#757575",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "600",
      border: "2px solid #e0e0e0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    };

    return (
      <div style={{ 
        marginRight: isCurrentUser ? "0" : "12px", 
        marginLeft: isCurrentUser ? "12px" : "0",
        flexShrink: 0
      }}>
        {message.sender.avatarUrl ? (
          <img
            src={getAvatarUrl(message.sender.avatarUrl)}
            alt={message.sender.username}
            style={avatarStyle}
            onError={(e) => {
              // Fallback bei Bild-Fehler - zeige Initialen
              const target = e.currentTarget;
              const fallback = document.createElement('div');
              fallback.style.cssText = Object.entries(fallbackStyle).map(([k, v]) => `${k}: ${v}`).join('; ');
              fallback.textContent = message.sender.username.charAt(0).toUpperCase();
              target.parentNode?.replaceChild(fallback, target);
            }}
          />
        ) : (
          <div style={fallbackStyle}>
            {message.sender.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  /**
   * Datei-Komponente mit MDB Design
   */
  const FileContent = () => {
    if (!message.fileUrl || !message.fileType) return null;

    const fileType = getFileType(message.fileType);
    const filename = extractFilenameFromUrl(message.fileUrl);
    const fileUrl = getFileUrl(filename);

    switch (fileType) {
      case 'image':
        return (
          <div className="mt-2">
            <img
              src={fileUrl}
              alt={message.content}
              style={{
                maxWidth: "280px",
                maxHeight: "200px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              className="img-fluid"
              onClick={() => window.open(fileUrl, '_blank')}
              onError={(e) => {
                console.error('Fehler beim Laden des Bildes:', fileUrl);
                e.currentTarget.style.display = 'none';
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
            {message.content && (
              <small className="text-muted d-block mt-2">{message.content}</small>
            )}
          </div>
        );

      case 'document':
        return (
          <MDBCard className="mt-2 border-0 shadow-2" style={{ maxWidth: "300px" }}>
            <MDBCardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {message.fileType === 'application/pdf' ? (
                    <MDBIcon icon="file-pdf" className="text-danger" size="2x" />
                  ) : (
                    <MDBIcon icon="file-alt" className="text-primary" size="2x" />
                  )}
                </div>
                <div className="flex-grow-1 me-2">
                  <div className="fw-bold text-truncate" style={{ maxWidth: "180px" }}>
                    {message.content}
                  </div>
                  <small className="text-muted">{message.fileType}</small>
                </div>
                <MDBBtn
                  color="primary"
                  size="sm"
                  floating
                  href={fileUrl}
                  download={message.content}
                  className="shadow-0"
                >
                  <MDBIcon icon="download" />
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        );

      default:
        return (
          <MDBCard className="mt-2 border-0 shadow-2" style={{ maxWidth: "300px" }}>
            <MDBCardBody className="p-3">
              <div className="d-flex align-items-center">
                <MDBIcon icon="paperclip" className="text-secondary me-3" size="lg" />
                <div className="flex-grow-1 me-2">
                  <div className="fw-bold text-truncate">{message.content}</div>
                  <small className="text-muted">{message.fileType}</small>
                </div>
                <MDBBtn
                  color="primary"
                  size="sm"
                  floating
                  href={fileUrl}
                  download={message.content}
                  className="shadow-0"
                >
                  <MDBIcon icon="download" />
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        );
    }
  };

  /**
   * Zeitstempel formatieren
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Heute: nur Uhrzeit
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      // Gestern
      return `Gestern ${date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      // Älter: Datum + Uhrzeit
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div className={`d-flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`} style={{ maxWidth: "75%" }}>
        {/* Avatar */}
        <Avatar />

        {/* Message Content */}
        <div className={`${isCurrentUser ? 'me-2' : 'ms-2'}`}>
          {/* Header mit Username, Zeit und Delete Button */}
          <div className={`d-flex align-items-center mb-2 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className="d-flex align-items-center gap-2">
              <MDBBadge 
                color={isCurrentUser ? 'primary' : 'secondary'} 
                pill 
                className="px-2 py-1"
              >
                {isCurrentUser ? 'Du' : message.sender.username}
              </MDBBadge>
              
              <small className="text-muted">
                {formatTimestamp(message.createdAt)}
              </small>
              
              {/* Delete Button (nur für eigene Nachrichten) */}
              {isCurrentUser && onDelete && (
                <MDBBtn
                  color="danger"
                  size="sm"
                  floating
                  className="shadow-0 opacity-75"
                  style={{ width: "24px", height: "24px" }}
                  onClick={() => onDelete(message.id)}
                  title="Nachricht löschen"
                >
                  <MDBIcon icon="bi bi-trash" size="xs" />
                </MDBBtn>
              )}
            </div>
          </div>

          {/* Message Body */}
          <MDBCard 
            className={`border-0 shadow-2 ${
              isCurrentUser 
                ? 'bg-primary text-white' 
                : 'bg-light'
            }`}
            style={{ 
              borderRadius: isCurrentUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              maxWidth: "100%",
              overflow: "hidden"
            }}
          >
            <MDBCardBody className="p-3">
              {/* Text Content */}
              {!message.fileUrl && message.content && (
                <div style={{ 
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: "1.4"
                }}>
                  {message.content}
                </div>
              )}

              {/* File Content */}
              <FileContent />
            </MDBCardBody>
          </MDBCard>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;