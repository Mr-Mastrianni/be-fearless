/**
 * Utility functions for handling micro-interactions and animations
 */

/**
 * Sets up intersection observers for scroll-triggered animations
 * Call this function in a useEffect hook at the component or page level
 */
export const setupScrollAnimations = () => {
  // Observer for fade-in elements
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Observer for staggered animations
  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Select all elements with scroll animation classes
  const fadeElements = document.querySelectorAll('.scroll-fade-in');
  const staggerElements = document.querySelectorAll('.staggered-animation');

  // Observe elements
  fadeElements.forEach((el) => fadeObserver.observe(el));
  staggerElements.forEach((el) => staggerObserver.observe(el));

  // Return cleanup function
  return () => {
    fadeElements.forEach((el) => fadeObserver.unobserve(el));
    staggerElements.forEach((el) => staggerObserver.unobserve(el));
  };
};

/**
 * Adds a ripple effect to an element on click
 * @param event - The click event
 */
export const addRippleEffect = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  ripple.classList.add('ripple');
  
  // Remove existing ripples
  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }
  
  button.appendChild(ripple);
  
  // Remove ripple after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

/**
 * Hook up a button with micro-interactions
 * @param props - Props for the button
 * @returns - Props with added micro-interaction handlers
 */
export const withMicroInteractions = (props: any) => {
  const originalOnClick = props.onClick;
  
  return {
    ...props,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      addRippleEffect(e);
      if (originalOnClick) {
        originalOnClick(e);
      }
    },
    className: `${props.className || ''} btn-micro-interaction`.trim(),
  };
};
