const BASE = "https://secure-blockchain-voting-system.onrender.com/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

export const api = {
  health: () => req("/health"),
  parties: () => req("/parties"),
  register: (body) => req("/register", { method: "POST", body: JSON.stringify(body) }),
  vote: (body) => req("/vote", { method: "POST", body: JSON.stringify(body) }),
  results: () => req("/results"),
  blockchain: () => req("/blockchain"),
  verify: (id) => req(`/verify/${id}`),
};
