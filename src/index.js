// "Warning: Added non-passive event listener to a scroll-blocking 'wheel' event"
// This seems to pop up across our apps, I thought it was Mapbox related
// (and Mapbox does add listeners that cause these warnings too).
// The following require() would remove the warning in Chrome, by wrapping
// all hanlders with the passive option set to true. However, the map will 
// then have errors with setState(). Warning or error. Pick your poison.
// The purpose of this warning is to warn you about potential scroll jank. 
// However, the application scrolls very smoothly in mobile and on desktops, 
// so it's likely fine to ignore the warning.
// Leaving this in here for a note. Maybe one day address/enable it.
// require('default-passive-events');
import './App';
