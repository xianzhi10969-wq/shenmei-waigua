import { mountStarNavigation } from './star-navigation.mjs?v=20261102-scene';
import { createSceneStarTrigger } from './star-navigation-anchor.mjs?v=20261107-seam';

// Only a verified destination is enabled. Add other feature URLs here when
// their actual pages join this host; never route multiple entries to P3.
window.starNavigation = mountStarNavigation({ trigger: createSceneStarTrigger(), routes: {
  feeling: {href:'/features/#/feeling'},
  curiosity: {href:'/features/#/curiosity'},
  imagery: {href:'/features/#/imagery'},
  resources: {href:'/resources/'},
  topics: { href: '?at=1', navigate: async () => {
    const { goToTopics } = await import('./transition.mjs?v=20261107-seam');
    goToTopics();
  } },
} });
