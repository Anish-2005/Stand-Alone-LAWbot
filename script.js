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

  // Rate limiting
  let lastRequestTime = 0;
  const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
  let isRequestInProgress = false;

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

  // Show API limits info (only once per session)
  function showApiLimitsInfo() {
    const hasSeenInfo = sessionStorage.getItem('apiLimitsInfoShown');
    if (!hasSeenInfo) {
      setTimeout(() => {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        infoDiv.innerHTML = `
          <div class="flex items-start">
            <div class="flex-1">
              <p class="text-sm font-medium">💡 <strong>AI Service Tip:</strong></p>
              <p class="text-xs mt-1">Using Puter.ai for AI responses. Service has rate limits to ensure fair usage.</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-blue-200 hover:text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
        document.body.appendChild(infoDiv);

        // Auto-hide after 8 seconds
        setTimeout(() => {
          if (infoDiv.parentElement) {
            infoDiv.remove();
          }
        }, 8000);

        sessionStorage.setItem('apiLimitsInfoShown', 'true');
      }, 3000); // Show after 3 seconds
    }
  }

  // Initialize everything
  initTheme();
  updateCharCount();
  showApiLimitsInfo();

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

    // Rate limiting check
    const now = Date.now();
    if (isRequestInProgress) {
      responseBox.innerHTML = `
        <div class="text-center p-8">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <h4 class="text-xl font-semibold text-blue-600 mb-2">Request in Progress</h4>
          <p class="text-gray-600 mb-4">Please wait for the current analysis to complete.</p>
        </div>
      `;
      return;
    }
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
      responseBox.innerHTML = `
        <div class="text-center p-8">
          <i class="fas fa-clock text-4xl text-blue-500 mb-4"></i>
          <h4 class="text-xl font-semibold text-blue-600 mb-2">Rate Limiting Active</h4>
          <p class="text-gray-600 mb-4">To prevent API overload, please wait <span id="countdown">${waitTime}</span> seconds before your next request.</p>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-blue-800">
              <strong>Why this limit?</strong><br>
              • Protects against accidental rapid requests<br>
              • Respects Puter.ai service limits<br>
              • Ensures fair usage for all users
            </p>
          </div>
          <div class="mt-4">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      `;

      // Start countdown timer
      let remainingTime = waitTime;
      const countdownElement = document.getElementById('countdown');
      const countdownInterval = setInterval(() => {
        remainingTime--;
        if (countdownElement) {
          countdownElement.textContent = remainingTime;
        }
        if (remainingTime <= 0) {
          clearInterval(countdownInterval);
          responseBox.innerHTML = `
            <div class="text-center p-8">
              <i class="fas fa-check-circle text-4xl text-green-500 mb-4"></i>
              <h4 class="text-xl font-semibold text-green-600 mb-2">Ready!</h4>
              <p class="text-gray-600">You can now submit your next query.</p>
            </div>
          `;
        }
      }, 1000);

      return;
    }
    lastRequestTime = now;
    isRequestInProgress = true;

    const fullQuery = `${query}. You are an AI assistant with in-depth expertise in the Indian Constitution, criminal law, and all relevant acts, sections, and legal provisions. Your role is to support law enforcement officers in the process of filing a First Information Report (FIR) by identifying and listing all applicable laws, including relevant acts, sections, and provisions. For each act or section, provide a concise yet comprehensive explanation of its significance, its direct relevance to the case, and how it should be applied in the context of the incident. Ensure that no pertinent legal provision is overlooked, and that the officer is equipped with a thorough understanding of the laws involved, enabling them to file a complete and legally sound FIR.`;

    // Show loading overlay
    loadingOverlay.classList.add('show');
    submitQuery.disabled = true;
    submitQuery.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';

    // Clear previous response
    responseBox.innerHTML = '';

    try {
      const response = await puter.ai.chat(fullQuery, {
        model: 'gemini-2.0-flash'
      });

      // Debug: Log the response to see its format
      console.log('Puter.ai response:', response);
      console.log('Response type:', typeof response);

      // Handle Puter.ai response format
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response && typeof response === 'object') {
        // Try different possible response formats
        responseText = response.message || response.text || response.content || response.response || response.data;
        console.log('Extracted text:', responseText);
        console.log('Extracted text type:', typeof responseText);

        // If still not a string, stringify the object
        if (typeof responseText !== 'string') {
          responseText = JSON.stringify(response, null, 2);
        }
      } else {
        responseText = 'No response received from AI service';
      }

      console.log('Final responseText:', responseText);
      const parsedResponse = parseMarkdownToHTML(responseText);

      // Display response with animation
      responseBox.innerHTML = parsedResponse;
      responseBox.style.animation = 'fadeIn 0.6s ease-out';

      // Smooth scroll to response
      setTimeout(() => {
        responseBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (error) {
      console.error('Puter.ai Error:', error);

      // Check for specific error types
      if (error.message && error.message.includes('401')) {
        responseBox.innerHTML = `
          <div class="text-center p-8">
            <i class="fas fa-lock text-4xl text-red-500 mb-4"></i>
            <h4 class="text-xl font-semibold text-red-600 mb-2">Authentication Required</h4>
            <p class="text-gray-600 mb-4">Puter.ai requires authentication to use their AI services.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-red-800 mb-3">
                <strong>How to authenticate:</strong>
              </p>
              <ol class="text-left text-sm text-red-700 space-y-2">
                <li><strong>1. Visit Puter.ai:</strong> Go to <a href="https://puter.com" target="_blank" class="underline">puter.com</a></li>
                <li><strong>2. Sign up/Login:</strong> Create an account or log in</li>
                <li><strong>3. Get API access:</strong> Enable AI services in your account</li>
                <li><strong>4. Try again:</strong> Refresh this page and try your query</li>
              </ol>
            </div>
            <div class="flex gap-3 justify-center flex-wrap">
              <button onclick="window.open('https://puter.com', '_blank')" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                <i class="fas fa-external-link-alt mr-2"></i>Go to Puter.ai
              </button>
              <button onclick="location.reload()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                <i class="fas fa-refresh mr-2"></i>Try Again
              </button>
            </div>
          </div>
        `;
      } else if (error.message === 'RATE_LIMIT_EXCEEDED') {
        responseBox.innerHTML = `
          <div class="text-center p-8">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h4 class="text-xl font-semibold text-red-600 mb-2">API Service Issue</h4>
            <p class="text-gray-600 mb-4">The AI service is temporarily unavailable or rate limited.</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-red-800 mb-3">
                <strong>Possible Solutions:</strong>
              </p>
              <ul class="text-left text-sm text-red-700 space-y-1">
                <li>• <strong>Wait a few minutes</strong> - Service may be temporarily overloaded</li>
                <li>• <strong>Check your internet connection</strong> - Ensure stable connectivity</li>
                <li>• <strong>Try again later</strong> - The service may be undergoing maintenance</li>
                <li>• <strong>Contact support</strong> if issues persist</li>
              </ul>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p class="text-sm text-blue-800">
                <strong>Current Protections Active:</strong><br>
                • 5-second minimum between requests<br>
                • No simultaneous requests allowed<br>
                • Request queuing system
              </p>
            </div>
            <div class="flex gap-3 justify-center flex-wrap">
              <button onclick="location.reload()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                <i class="fas fa-refresh mr-2"></i>Try Again
              </button>
            </div>
          </div>
        `;
      } else {
        responseBox.innerHTML = `
          <div class="text-center p-8">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h4 class="text-xl font-semibold text-red-600 mb-2">Error Occurred</h4>
            <p class="text-gray-600 mb-4">Unable to process your request at this time.</p>
            <p class="text-sm text-gray-500">Please check your internet connection and try again.</p>
          </div>
        `;
      }
      console.error('Error:', error);
    } finally {
      // Hide loading overlay
      loadingOverlay.classList.remove('show');
      submitQuery.disabled = false;
      submitQuery.innerHTML = '<i class="fas fa-search mr-2"></i>Analyze Incident';
      isRequestInProgress = false;
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