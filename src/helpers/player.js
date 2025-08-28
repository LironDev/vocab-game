export function getOrCreatePlayerId() {
  let id = localStorage.getItem("playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("playerId", id);
  }
  return id;
}

export function loadPlayerData() {
  const name = localStorage.getItem("playerName") || "";
  const gender = localStorage.getItem("playerGender") || "";
  const id = getOrCreatePlayerId();
  return { id, name, gender };
}

export function savePlayerData(name, gender) {
  localStorage.setItem("playerName", name);
  localStorage.setItem("playerGender", gender);
}

