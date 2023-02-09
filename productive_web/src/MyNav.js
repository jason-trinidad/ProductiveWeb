import React from "react";
import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

import { auth } from "./db/db";
import { signInWithGoogle } from "./auth";

const MyNav = (props) => {
  const handleSelect = (eventKey) => {
    if (eventKey === "Sign out") auth.signOut();
  }

  return (
    <Navbar bg="dark" variant="dark" className="nav" onSelect={handleSelect}>
      {props.isGoogleSignIn ? (
        <NavDropdown title={<strong>{auth.currentUser.email}</strong>}>
          <NavDropdown.Item eventKey="Sign out">Sign out</NavDropdown.Item>
        </NavDropdown>
      ) : (
        <Button variant="primary mr-1" size="sm" onClick={signInWithGoogle}>
          Sign In
        </Button>
      )}
    </Navbar>
  );
};

export default MyNav;
