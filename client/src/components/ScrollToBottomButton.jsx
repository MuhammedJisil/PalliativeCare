import React, { useState, useEffect } from 'react';
import { ChevronsDown } from 'lucide-react';

const ScrollToBottomButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    // Show button when page is scrolled up enough
    const scrolled = document.documentElement.scrollTop;
    setIsVisible(scrolled > 300);
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up the event listener
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Only render if scrolling is needed
  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="fixed bottom-20 right-4 z-50 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 transition-colors duration-200 animate-bounce"
      aria-label="Scroll to Bottom"
    >
      <ChevronsDown size={24} />
    </button>
  );
};

export default ScrollToBottomButton;