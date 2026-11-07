// Mobile counterpart of the approved v4 scroll flight. Source art stays intact.
import {clamp, ease} from './paper-motion.mjs';

export function createMobileHomeStar(stack, scene, seatedStar) {
  const ns = 'http://www.w3.org/2000/svg';
  const vacancy = document.createElementNS(ns, 'svg');
  vacancy.setAttribute('viewBox', '0 0 780 1688');
  vacancy.setAttribute('aria-hidden', 'true');
  vacancy.classList.add('mobile-star-vacancy');
  // Reuse the adopted blink mask to cover only the star's original pixels.
  vacancy.innerHTML = '<path d="M145 1155L182 1190 199 1227 183 1265 145 1290 106 1265 91 1227 106 1189Z" fill="#faf7f1"/>';
  scene.append(vacancy);

  const flyingStar = document.createElement('div');
  flyingStar.id = 'mobile-falling-star';
  flyingStar.setAttribute('aria-hidden', 'true');
  for (const color of ['ink', 'cream']) {
    const image = document.createElement('img');
    image.className = color;
    image.alt = '';
    image.src = `./p1-p2-reveal-star-v4-2026-10-21/star-svg/B_${color}.svg`;
    flyingStar.append(image);
  }
  stack.append(flyingStar);
  const cream = flyingStar.querySelector('.cream');

  return function renderMobileStar(scroll, limit, width, reduced) {
    const scale = width / 390;
    const progress = clamp(scroll / Math.max(1, limit));
    const flight = reduced ? 0 : ease((progress - .03) / .97);
    const moving = !reduced && progress > .03;
    const y = 613.5 + (1703 - 613.5) * (.35 * flight ** 2 + .65 * flight);
    // The phone has one text column. Pass its four questions through the empty
    // left margin, then regain the original water-star size below the last line.
    const margin = ease((y - 975) / 75) * (1 - ease((y - 1460) / 160));
    const x = 72.5 + (70 - 72.5) * (1 - (1 - flight) ** 2) - 57 * margin;
    const size = 90 - 45 * margin;
    const rotation = 4 * Math.sin(Math.PI * flight);
    // The original wave meets this nearly vertical flight at document y≈955.
    const water = ease((y - 925) / 80);
    stack.dataset.starFlight = String(moving);
    stack.dataset.starSeated = String(reduced || flight >= 1);
    flyingStar.style.visibility = moving && flight < 1 ? 'visible' : 'hidden';
    flyingStar.style.width = flyingStar.style.height = `${size * scale}px`;
    flyingStar.style.transform = `translate3d(${(x - size / 2) * scale}px,${(y - size / 2) * scale}px,0) rotate(${rotation}deg)`;
    cream.style.opacity = water;
    seatedStar.style.visibility = reduced || flight >= 1 ? 'visible' : 'hidden';
    Object.assign(stack.dataset, {
      flight: flight.toFixed(6), flightX: (x * scale).toFixed(3),
      flightY: (y * scale).toFixed(3), flightSize: (size * scale).toFixed(3),
      flightCream: water.toFixed(6),
    });
  };
}
