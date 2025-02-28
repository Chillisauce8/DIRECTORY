/**
 * Message Store Bridge
 * 
 * Re-export the base message store to ensure compatibility in the car layer
 * This follows the "bridge files strategy" from our architecture docs
 */

// Re-export the store from the base layer
export { useMessageStore } from '../../base/stores/useMessageStore';

// If any car-specific extensions are needed, they can be added here:
// import { useMessageStore as useBaseMessageStore } from '../../base/stores/useMessageStore';
// import { defineStore } from 'pinia';
//
// export const useMessageStore = defineStore('messages', {
//   // Extend the base store with car-specific functionality
//   ...
// });
