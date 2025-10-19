import { useState } from "react";
import { MDBBtn, MDBInput, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter } from 'mdb-react-ui-kit';
import { updatePassword } from "../api/profileApi";

export default function ChangePasswordModal({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await updatePassword(token!, oldPassword, newPassword);
      setSuccess("Passwort erfolgreich geändert!");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        setError(errorObj.response?.data?.error || "Fehler beim Ändern des Passworts.");
      } else {
        setError("Fehler beim Ändern des Passworts.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBModal open={open} setOpen={setOpen} tabIndex='-1'>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Passwort ändern</MDBModalTitle>
            <MDBBtn className='btn-close' color='none' onClick={() => setOpen(false)}></MDBBtn>
          </MDBModalHeader>
          <form onSubmit={handleChange}>
            <MDBModalBody>
              <MDBInput
                wrapperClass='mb-4'
                label='Altes Passwort'
                id='oldPassword'
                type='password'
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Neues Passwort'
                id='newPassword'
                type='password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              {error && <div style={{ color: "#ED6A5E", textAlign: "center" }}>{error}</div>}
              {success && <div style={{ color: "#2C7A7B", textAlign: "center" }}>{success}</div>}
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn type="submit" disabled={loading}>{loading ? "Speichern..." : "Speichern"}</MDBBtn>
            </MDBModalFooter>
          </form>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
