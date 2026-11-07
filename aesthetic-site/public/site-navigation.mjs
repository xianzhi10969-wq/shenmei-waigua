import { mountStarNavigation } from '/entrance/star-navigation.mjs';

const parent = document.createElement('div');
parent.className = 'site-directory-slot';
const trigger = document.createElement('button');
trigger.type = 'button';
trigger.className = 'site-directory-trigger';
trigger.textContent = '打开全站目录';
parent.append(trigger);
document.body.prepend(parent);
const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = '/entrance/star-navigation.css';
document.head.append(stylesheet);
window.starNavigation = mountStarNavigation({
  trigger,
  routes: {
    feeling: { href: '/features/#/feeling' },
    topics: { href: '/#/chapters' },
    curiosity: { href: '/features/#/curiosity' },
    imagery: { href: '/features/#/imagery' },
    resources: { href: '/resources/' },
  },
});
