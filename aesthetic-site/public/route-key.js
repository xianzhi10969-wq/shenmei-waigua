// Record IDs are case-sensitive. Hex encoding prevents collisions on Mac file systems.
window.storageKey = function storageKey(recordId) {
  return Array.from(new TextEncoder().encode(recordId), byte => byte.toString(16).padStart(2, '0')).join('');
};
