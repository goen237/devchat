import { MDBFooter, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

export default function Footer() {
  return (
    <MDBFooter className="text-center text-lg-start text-white" style={{ background: "linear-gradient(90deg, #2C7A7B 0%, #ED6A5E 100%)", marginTop: 40 }}>
      <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5">
        <div className="mb-3 mb-md-0" style={{ color: "#fff", fontWeight: 500 }}>
          Copyright &copy; {new Date().getFullYear()} DevChat. All rights reserved.
        </div>
        <div>
          <MDBBtn tag='a' color='none' className='mx-2' style={{ color: 'white' }} href="#">
            <MDBIcon fab icon='bi bi-facebook' size="lg" />
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-2' style={{ color: 'white' }} href="#">
            <MDBIcon fab icon='bi bi-twitter' size="lg" />
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-2' style={{ color: 'white' }} href="#">
            <MDBIcon fab icon='bi bi-google' size="lg" />
          </MDBBtn>
          <MDBBtn tag='a' color='none' className='mx-2' style={{ color: 'white' }} href="#">
            <MDBIcon fab icon='bi bi-linkedin' size="lg" />
          </MDBBtn>
        </div>
      </div>
    </MDBFooter>
  );
}
