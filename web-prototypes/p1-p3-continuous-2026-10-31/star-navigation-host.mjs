import { mountStarNavigation } from './star-navigation.mjs?v=20261102-scene';
import { createSceneStarTrigger } from './star-navigation-anchor.mjs?v=20261102-scene';

// Only a verified destination is enabled. Add other feature URLs here when
// their actual pages join this host; never route multiple entries to P3.
mountStarNavigation({ trigger: createSceneStarTrigger(), routes: {
  topics: { href: '?at=1', navigate: async () => {
    const { goToTopics } = await import('./transition.mjs?v=20261102-nav');
    goToTopics();
  } },
} });
