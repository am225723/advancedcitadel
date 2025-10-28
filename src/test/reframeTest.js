// Simple test to verify imports work correctly
import { getGuideReframeResponse, saveGuideInteraction } from '../lib/guideService.js';

console.log('Testing imports...');
console.log('getGuideReframeResponse function:', typeof getGuideReframeResponse);
console.log('saveGuideInteraction function:', typeof saveGuideInteraction);

if (typeof getGuideReframeResponse === 'function' && typeof saveGuideInteraction === 'function') {
  console.log('SUCCESS: All imports are working correctly');
} else {
  console.log('ERROR: Some imports are not working correctly');
}