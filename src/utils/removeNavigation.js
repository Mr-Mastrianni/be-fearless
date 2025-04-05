/**
 * This is an aggressive solution to completely remove any navigation elements
 * from the DOM on load and periodically afterward
 */

function removeNavigationElements() {
  console.log('Running navigation removal...');
  
  // Direct element selectors that might contain navigation items
  const selectors = [
    'nav:not(.simple-navbar)', '.nav', '.navbar', '.navigation', 'header', '#header', '.header',
    '.tabs', '.tab-list', '.tablist', '[role="navigation"]:not(.simple-navbar)', '[role="tablist"]',
    '.tab-navigation', '.menu-container', '[class*="navbar"]:not(.simple-navbar)', '[class*="nav-"]'
  ];
  
  // Remove elements matching our selectors
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Skip our SimpleNavbar component
      if (el.id === 'simple-navbar-root' || 
          el.classList.contains('simple-navbar') || 
          el.closest('.simple-navbar')) {
        console.log('Skipping our SimpleNavbar:', el);
        return;
      }
      console.log('Removing element:', el);
      el.remove();
    });
  });
  
  // Find and remove any links that look like navigation items
  const links = document.querySelectorAll('a, button');
  const navTerms = ['home', 'dashboard', 'activity', 'activities', 'sign in', 'sign up', 'get started', 'profile'];
  
  links.forEach(link => {
    const linkText = (link.textContent || '').toLowerCase();
    if (navTerms.some(term => linkText.includes(term))) {
      console.log('Removing link with text:', link.textContent);
      link.remove();
    }
  });
  
  // Reset top padding/margin on body and main containers
  const containers = document.querySelectorAll('body, #root, main, [class*="container"]');
  containers.forEach(container => {
    container.style.paddingTop = '0';
    container.style.marginTop = '0';
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  removeNavigationElements();
  
  // Run periodically to catch dynamically added elements
  setInterval(removeNavigationElements, 500);
});

// Make sure we run even if the DOMContentLoaded already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', removeNavigationElements);
} else {
  removeNavigationElements();
  setInterval(removeNavigationElements, 500);
}
