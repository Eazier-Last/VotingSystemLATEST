import React, { lazy, Suspense, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Header from "./components/Header";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const Two = lazy(() => import("./components/Two"));
const Three = lazy(() => import("./components/Three"));
const Four = lazy(() => import("./components/Four"));

function Main({ onLogout }) {
  const [activeComponent, setActiveComponent] = useState("");

  const loadComponent = (path) => {
    switch (path) {
      case "/home":
        setActiveComponent(<Home />);
        break;
      case "/two":
        setActiveComponent(
          <Suspense fallback={<div>Loading...</div>}>
            <Two />
          </Suspense>
        );
        break;
      case "/three":
        setActiveComponent(
          <Suspense fallback={<div>Loading...</div>}>
            <Three />
          </Suspense>
        );
        break;
      case "/four":
        setActiveComponent(
          <Suspense fallback={<div>Loading...</div>}>
            <Four />
          </Suspense>
        );
        break;
      default:
        setActiveComponent(<div>Select a component from the sidebar.</div>);
        break;
    }
  };

  useEffect(() => {
    loadComponent(window.location.pathname);
  }, []);

  return (
    <div className="App">
      <Sidebar loadComponent={loadComponent} />
      <Header />

      <div className="ContentArea">{activeComponent}</div>

      {/* Logout Button */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000, // Ensure it's on top of other components
        }}
      >
        <Button
          sx={{
            backgroundColor: "#1ab394",
            marginTop: "10px",
            position: "fixed",
            right: 50,
          }}
          variant="contained"
          color="secondary"
          onClick={() => {
            console.log("Logout button clicked"); // Debugging line
            onLogout();
          }}
        >
          <PowerSettingsNewIcon />
        </Button>
      </div>
    </div>
  );
}

export default Main;
