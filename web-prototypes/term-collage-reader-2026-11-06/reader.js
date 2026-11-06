const plate = document.querySelector('#plate');
const openButton = document.querySelector('#open-board');
const closeButton = document.querySelector('#close-board');
const boardFrame = document.querySelector('#board-frame');
let savedY = 0;
let previousFocus = null;
let previousBodyStyle = '';
function openPlate() {
  if (plate.open) return;
  savedY = window.scrollY;
  previousFocus = document.activeElement;
  previousBodyStyle = document.body.getAttribute('style') || '';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedY}px`;
  document.body.style.width = '100%';
  plate.showModal();
  closeButton.focus({preventScroll:true});
}
function closePlate() {
  if (plate.open) plate.close();
}
plate.addEventListener('close', () => {
  document.body.setAttribute('style', previousBodyStyle);
  window.scrollTo(0, savedY);
  previousFocus?.focus({preventScroll:true});
});
openButton.addEventListener('click', openPlate);
closeButton.addEventListener('click', closePlate);
window.addEventListener('message', event => {
  if (event.source !== boardFrame.contentWindow) return;
  if (event.origin !== location.origin) return;
  if (event.data?.type === 'close-collage') closePlate();
});
