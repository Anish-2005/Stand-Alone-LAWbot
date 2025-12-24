// script.js - JavaScript functionality for LawAI application

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const infoButton = document.getElementById('infoButton');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const queryInput = document.getElementById('queryInput');
  const submitQuery = document.getElementById('submitQuery');
  const responseBox = document.getElementById('responseBox');
  const scrollToTop = document.getElementById('scrollToTop');

  // Utility function to parse markdown to HTML
  const parseMarkdownToHTML = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  };

  // Scroll to top button logic
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTop.classList.add('show');
    } else {
      scrollToTop.classList.remove('show');
    }
  });

  scrollToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Modal logic
  infoButton.addEventListener('click', () => {
    modal.classList.add('show');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

  // Trigger the submit query button when Enter is pressed
  queryInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      submitQuery.click();
    }
  });

  // Main query submission logic
  submitQuery.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    if (!query) return;

    const fullQuery = `${query}. You are an AI assistant with in-depth expertise in the Indian Constitution, criminal law, and all relevant acts, sections, and legal provisions. Your role is to support law enforcement officers in the process of filing a First Information Report (FIR) by identifying and listing all applicable laws, including relevant acts, sections, and provisions. For each act or section, provide a concise yet comprehensive explanation of its significance, its direct relevance to the case, and how it should be applied in the context of the incident. Ensure that no pertinent legal provision is overlooked, and that the officer is equipped with a thorough understanding of the laws involved, enabling them to file a complete and legally sound FIR.`;

    // Show loading animation
    responseBox.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full">
        <div class="spinner"></div>
        <p class="loading-message">Analyzing your query and retrieving relevant legal information...</p>
      </div>
    `;

    try {
      const response = await fetch('https://chatbot-for-fir-backend.vercel.app/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullQuery }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const parsedResponse = parseMarkdownToHTML(data.response || 'No response received');

      // Add fade-in animation to response
      responseBox.innerHTML = parsedResponse;
      responseBox.style.animation = 'fadeIn 0.5s ease-in';

    } catch (error) {
      responseBox.innerHTML = `
        <div class="text-center text-red-600">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p class="text-lg font-semibold">Error occurred while fetching the response</p>
          <p class="text-sm mt-2">Please try again later or check your internet connection.</p>
        </div>
      `;
      console.error('Error:', error);
    }

    // Clear the input field after submission
    queryInput.value = '';

    // Smooth scroll to response box
    setTimeout(() => {
      responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });

  // Add fade-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // Add input focus enhancement
  queryInput.addEventListener('focus', () => {
    queryInput.parentElement.style.transform = 'scale(1.02)';
  });

  queryInput.addEventListener('blur', () => {
    queryInput.parentElement.style.transform = 'scale(1)';
  });
});