import { mountArtResources } from './p5.mjs';
import { mountStarNavigation } from '/entrance/star-navigation.mjs';

mountArtResources(document.querySelector('#p5'), {
  onSelect: ({ id }) => location.assign('/features/#/resources/' + id),
  onNavigate: () => directory.open(),
  onContinue: () => location.assign('/features/#/imagery'),
});
const directory = mountStarNavigation({
  trigger: document.querySelector('.p5-navigation'),
  initial: 'resources',
  routes: {
    feeling: { href: '/features/#/feeling' },
    topics: { href: '/#/chapters' },
    curiosity: { href: '/features/#/curiosity' },
    imagery: { href: '/features/#/imagery' },
    resources: { href: '/resources/' },
  },
});
