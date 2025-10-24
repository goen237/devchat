import React, { useState, useRef } from 'react';
import { 
  MDBBtn, 
  MDBIcon,
  MDBTextArea,
  MDBProgress,
  MDBProgressBar,
  MDBCard,
  MDBCardBody
} from 'mdb-react-ui-kit';
import { uploadFileMessage } from '../api/messageApi';

/**
 * Chat Input Component - Nachrichten und Dateien senden
 * 
 * Features:
 * - Text-Nachrichten (über Socket.io)
 * - Datei-Upload (über HTTP)
 * - Drag & Drop für Dateien
 * - Upload-Progress
 * - Emoji-Support (planned)
 */

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onFileUploaded: (messageId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  chatRoomId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUploaded,
  disabled = false,
  placeholder = "Nachricht eingeben...",
  chatRoomId
}) => {
  // ===== STATE =====
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== TEXT MESSAGE HANDLING =====

  /**
   * Text-Nachricht senden
   */
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  /**
   * Enter-Key Handler
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * MDB Textarea Auto-Resize (angepasst für MDBTextArea)
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize für MDB textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // ===== FILE UPLOAD HANDLING =====

  /**
   * Datei-Upload durchführen
   */
  const handleFileUpload = async (file: File) => {
    if (!file || isUploading) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      console.log('📤 Starte Datei-Upload:', file.name);

      // HTTP-Upload über API
      const uploadedMessage = await uploadFileMessage(file, chatRoomId);
      
      console.log('✅ Datei erfolgreich hochgeladen:', uploadedMessage.id);
      
      // Socket-Benachrichtigung für Real-time Updates
      onFileUploaded(uploadedMessage.id);
      
    } catch (error) {
      setIsUploading(false);
      console.error('❌ Datei-Upload fehlgeschlagen:', error);
      alert(`Datei-Upload fehlgeschlagen: ${error}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Datei-Input Change Handler
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Input zurücksetzen für erneute Auswahl der gleichen Datei
    e.target.value = '';
  };

  /**
   * Datei-Auswahl triggern
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ===== DRAG & DROP HANDLING =====

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]); // Nur erste Datei
    }
  };

  // ===== PROGRESS INDICATOR mit MDB =====
  const ProgressIndicator = () => {
    if (!isUploading) return null;

    return (
      <div className="position-absolute top-0 start-0 w-100" style={{ zIndex: 20 }}>
        <MDBProgress height="3">
          <MDBProgressBar 
            valuemax={100} 
            valuemin={0} 
            valuenow={uploadProgress}
            style={{ backgroundColor: "#1976d2" }}
          />
        </MDBProgress>
      </div>
    );
  };

  return (
    <div className="position-relative">
      {/* Progress Indicator */}
      <ProgressIndicator />

      {/* Upload Overlay mit MDB Design */}
      {dragOver && (
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 border border-primary border-3 border-dashed rounded"
          style={{ zIndex: 15 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <MDBCard className="text-center border-0 bg-transparent">
            <MDBCardBody>
              <MDBIcon icon="bi bi-cloud-upload-alt" size="4x" className="text-primary mb-3" />
              <h5 className="text-primary fw-bold">Datei hier ablegen</h5>
              <p className="text-muted">Loslassen zum Hochladen</p>
            </MDBCardBody>
          </MDBCard>
        </div>
      )}

      {/* 🔥 IMPROVED: Input Container mit MDB Design */}
      <div 
        className="d-flex align-items-end gap-3 p-3 border-top bg-white"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="d-none"
          accept="image/*,.pdf,.txt,.doc,.docx,.xlsx,.pptx"
        />

        {/* File Upload Button */}
        <MDBBtn
          color="secondary"
          size="lg"
          floating
          onClick={triggerFileSelect}
          disabled={disabled || isUploading}
          title="Datei anhängen"
          className="shadow-3"
        >
          <MDBIcon icon="bi bi-paperclip" />
        </MDBBtn>

        {/* Text Input */}
        <div className="flex-grow-1 position-relative">
          <MDBTextArea
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            rows={1}
            size="lg"
            className="shadow-2"
            style={{ 
              minHeight: '50px', 
              maxHeight: '120px',
              resize: 'none'
            }}
          />
          
          {/* Character Count */}
          {message.length > 1800 && (
            <div className="position-absolute bottom-0 end-0 me-2 mb-1">
              <small className={`badge ${message.length > 1950 ? 'bg-danger' : 'bg-warning'}`}>
                {2000 - message.length}
              </small>
            </div>
          )}
        </div>

        {/* Send Button */}
        <MDBBtn
          color="primary"
          size="lg"
          floating
          onClick={handleSendMessage}
          disabled={disabled || isUploading || !message.trim()}
          title="Nachricht senden"
          className="shadow-3"
        >
          <MDBIcon icon="bi bi-send" />
        </MDBBtn>
      </div>

      {/* Upload Status mit MDB */}
      {isUploading && (
        <div className="p-2 bg-light border-top">
          <div className="d-flex align-items-center gap-2 text-primary">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <small>Datei wird hochgeladen...</small>
            <MDBBtn 
              color="danger" 
              size="sm" 
              floating 
              onClick={() => setIsUploading(false)}
              title="Abbrechen"
              className="ms-auto"
            >
              <MDBIcon icon="bi bi-times" size="xs" />
            </MDBBtn>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;