import React, { useState, useEffect } from 'react';
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
  MDBRow,
  MDBCol,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { avatarApi, type Avatar } from '../api/avatars';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelected: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  onAvatarSelected,
  currentAvatarUrl
}) => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvatars();
      if (currentAvatarUrl) {
        // Extract avatar name from URL
        const avatarName = currentAvatarUrl.split('/').pop() || '';
        setSelectedAvatar(avatarName);
      }
    }
  }, [isOpen, currentAvatarUrl]);

  const loadAvatars = async () => {
    setLoading(true);
    try {
      const availableAvatars = await avatarApi.getAvailableAvatars();
      setAvatars(availableAvatars);
    } catch (error) {
      console.error('Error loading avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;

    setSaving(true);
    try {
      await avatarApi.selectAvatar(selectedAvatar);
      const selectedAvatarData = avatars.find(avatar => avatar.name === selectedAvatar);
      if (selectedAvatarData) {
        onAvatarSelected(selectedAvatarData.url);
      }
      onClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MDBModal open={isOpen} onClose={onClose} tabIndex='-1'>
      <MDBModalDialog size="lg">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Wähle dein Avatar</MDBModalTitle>
            <MDBBtn
              className='btn-close'
              color='none'
              onClick={onClose}
            ></MDBBtn>
          </MDBModalHeader>
          
          <MDBModalBody>
            {loading ? (
              <div className="text-center py-4">
                <MDBSpinner />
                <p className="mt-2">Lade Avatare...</p>
              </div>
            ) : (
              <MDBRow>
                {avatars.map((avatar) => (
                  <MDBCol key={avatar.name} md="4" className="mb-3">
                    <div
                      className={`avatar-option ${
                        selectedAvatar === avatar.name ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedAvatar(avatar.name)}
                      style={{
                        border: selectedAvatar === avatar.name ? '3px solid #007bff' : '2px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={`http://localhost:3000${avatar.url}`}
                        alt={avatar.displayName}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          marginBottom: '8px'
                        }}
                      />
                      <div className="small">{avatar.displayName}</div>
                    </div>
                  </MDBCol>
                ))}
              </MDBRow>
            )}
          </MDBModalBody>
          
          <MDBModalFooter>
            <MDBBtn color="secondary" onClick={onClose}>
              Abbrechen
            </MDBBtn>
            <MDBBtn 
              color="primary" 
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar || saving}
            >
              {saving ? (
                <>
                  <MDBSpinner size="sm" className="me-2" />
                  Speichern...
                </>
              ) : (
                'Avatar auswählen'
              )}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
};

export default AvatarSelector;