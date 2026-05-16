import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Chain from "./pages/Chain";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (p) => setPage(p);

  return (
    <div className="app">
      <Navbar current={page} navigate={navigate} />
      <main className="main-content">
        {page === "home" && <Home navigate={navigate} />}
        {page === "register" && <Register navigate={navigate} />}
        {page === "vote" && <Vote navigate={navigate} />}
        {page === "results" && <Results navigate={navigate} />}
        {page === "chain" && <Chain navigate={navigate} />}
      </main>
    </div>
  );
}
