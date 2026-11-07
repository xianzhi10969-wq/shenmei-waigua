const boards = JSON.parse(document.querySelector("#boards").textContent);
const viewer = document.querySelector("#viewer");
const original = viewer.querySelector("img");
const caption = viewer.querySelector("p");
const official = viewer.querySelector("a");
let trigger;

document.querySelector("main").addEventListener("click", (event) => {
  const link = event.target.closest("[data-piece]");
  if (!link) return;

  event.preventDefault();
  trigger = link;
  const piece = boards[link.closest("section").id][Number(link.dataset.piece)];
  original.src = piece.asset;
  original.alt = piece.title;
  caption.textContent = piece.title + (piece.reference ? " · 补充参考" : "");
  official.hidden = !piece.official;
  if (piece.official) official.href = piece.official;
  viewer.showModal();
});

viewer.querySelector("button").addEventListener("click", () => viewer.close());
viewer.addEventListener("close", () => {
  original.removeAttribute("src");
  trigger?.focus();
});
