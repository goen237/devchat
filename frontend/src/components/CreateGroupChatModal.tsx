import { useState, useEffect } from "react";
import { MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter, MDBBtn, MDBInput } from 'mdb-react-ui-kit';
import { getAllUsers, createGroupChat } from "../api/chatApi";

interface User {
  id: string;
  username: string;
  email: string;
}

export default function CreateGroupChatModal({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const currentUserId = localStorage.getItem("userId"); // Assumons que l'ID utilisateur est stocké
      
      getAllUsers()
        .then(res => {
          // Exclure l'utilisateur actuel de la liste des participants
          const filteredUsers = res.filter((user: User) => user.id !== currentUserId);
          setUsers(filteredUsers);
        })
        .catch(() => setError("Fehler beim Laden der Nutzer."));
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim() || selected.length < 1) {
      setError("Bitte Namen und mindestens einen Teilnehmer wählen.");
      return;
    }
    try {
      const chatRoom = await createGroupChat(name, selected);
      window.location.href = `/chatroom/${chatRoom.id}`;
    } catch {
      setError("Fehler beim Erstellen des Gruppenchats.");
    }
  };

  return (
    <MDBModal open={open} setOpen={setOpen} tabIndex="-1">
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Neuen Gruppenchat erstellen</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={() => setOpen(false)}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <MDBInput label="Gruppenname" value={name} onChange={e => setName(e.target.value)} className="mb-3" />
            <div>Teilnehmer auswählen (Sie werden automatisch hinzugefügt):</div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {users.map((user: User) => (
                <div key={user.id}>
                  <input type="checkbox" id={user.id} checked={selected.includes(user.id)} onChange={e => {
                    setSelected(e.target.checked ? [...selected, user.id] : selected.filter(id => id !== user.id));
                  }} />
                  <label htmlFor={user.id} style={{ marginLeft: 8 }}>{user.username} ({user.email})</label>
                </div>
              ))}
            </div>
            {error && <div style={{ color: "#ED6A5E" }}>{error}</div>}
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn onClick={handleCreate}>Erstellen</MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
