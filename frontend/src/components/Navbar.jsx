export default function Navbar({ current, navigate }) {
  const links = [
    { key: "home", label: "Home" },
    { key: "register", label: "Register" },
    { key: "vote", label: "Vote" },
    { key: "results", label: "Results" },
    { key: "chain", label: "Blockchain" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate("home")}>
        <div className="logo-icon">⛓</div>
        <span>Vote<span className="accent">Chain</span></span>
      </div>
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.key}>
            <button
              className={current === l.key ? "active" : ""}
              onClick={() => navigate(l.key)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
