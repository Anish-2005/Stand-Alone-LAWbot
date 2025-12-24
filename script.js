// script.js - Enhanced JavaScript functionality for LawAI application

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const themeToggle = document.getElementById('themeToggle');
  const infoButton = document.getElementById('infoButton');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const queryInput = document.getElementById('queryInput');
  const submitQuery = document.getElementById('submitQuery');
  const responseBox = document.getElementById('responseBox');
  const scrollToTop = document.getElementById('scrollToTop');
  const scrollToQuery = document.getElementById('scrollToQuery');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const charCount = document.getElementById('charCount');

  // Theme management
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // Character counting
  function updateCharCount() {
    const count = queryInput.value.length;
    charCount.textContent = count;
    submitQuery.disabled = count === 0;
  }

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

  // Scroll to query section
  scrollToQuery.addEventListener('click', () => {
    const querySection = document.getElementById('querySection');
    querySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

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

  // Character counting
  queryInput.addEventListener('input', updateCharCount);

  // Trigger the submit query button when Enter is pressed (Ctrl+Enter for textarea)
  queryInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      submitQuery.click();
    }
  });

  // Form submission
  const queryForm = document.querySelector('.query-form');
  queryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitQuery.click();
  });

  // Main query submission logic
  submitQuery.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    if (!query) return;

    const fullQuery = `${query}. You are an AI assistant with in-depth expertise in the Indian Constitution, criminal law, and all relevant acts, sections, and legal provisions. Your role is to support law enforcement officers in the process of filing a First Information Report (FIR) by identifying and listing all applicable laws, including relevant acts, sections, and provisions. For each act or section, provide a concise yet comprehensive explanation of its significance, its direct relevance to the case, and how it should be applied in the context of the incident. Ensure that no pertinent legal provision is overlooked, and that the officer is equipped with a thorough understanding of the laws involved, enabling them to file a complete and legally sound FIR.`;

    // Show loading overlay
    loadingOverlay.classList.add('show');

    // Clear previous response
    responseBox.innerHTML = '';

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

      // Display response with animation
      responseBox.innerHTML = parsedResponse;
      responseBox.style.animation = 'fadeIn 0.6s ease-out';

      // Smooth scroll to response
      setTimeout(() => {
        responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (error) {
      responseBox.innerHTML = `
        <div class="text-center p-8">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h4 class="text-xl font-semibold text-red-600 mb-2">Error Occurred</h4>
          <p class="text-gray-600 mb-4">Unable to process your request at this time.</p>
          <p class="text-sm text-gray-500">Please check your internet connection and try again.</p>
        </div>
      `;
      console.error('Error:', error);
    } finally {
      // Hide loading overlay
      loadingOverlay.classList.remove('show');
    }

    // Clear the input field after submission
    queryInput.value = '';
    updateCharCount();
  });

  // Initialize theme on page load
  initTheme();

  // Initialize character count
  updateCharCount();

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = '0.2s';
        entry.target.style.animationFillMode = 'forwards';
      }
    });
  }, observerOptions);

  // Observe elements for animations
  document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
    observer.observe(el);
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      queryInput.focus();
      queryInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Escape to close modal
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  });

  // Add loading state to submit button
  submitQuery.addEventListener('click', function() {
    if (!this.disabled) {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
      this.disabled = true;

      // Re-enable after processing starts
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-search"></i> Analyze Incident';
        this.disabled = false;
      }, 1000);
    }
  });

  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add visual feedback for form interactions
  queryInput.addEventListener('focus', () => {
    queryInput.parentElement.style.transform = 'scale(1.01)';
  });

  queryInput.addEventListener('blur', () => {
    queryInput.parentElement.style.transform = 'scale(1)';
  });

  // Performance optimization: Debounce scroll events
  let scrollTimeout;
  const debouncedScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Scroll handling logic can be added here if needed
    }, 16);
  };

  window.addEventListener('scroll', debouncedScroll);
});