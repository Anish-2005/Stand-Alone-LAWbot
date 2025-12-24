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
  const downloadPdf = document.getElementById('downloadPdf');
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
    // Ensure text is a string
    if (typeof text !== 'string') {
      console.warn('parseMarkdownToHTML received non-string:', text);
      text = String(text || 'No response content');
    }

    // Split into lines for better processing
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listType = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Headers
      if (line.match(/^### (.*$)/)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 class="text-lg font-semibold mt-4 mb-2">${line.replace(/^### /, '')}</h3>`;
        continue;
      }
      if (line.match(/^## (.*$)/)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 class="text-xl font-semibold mt-6 mb-3">${line.replace(/^## /, '')}</h2>`;
        continue;
      }
      if (line.match(/^# (.*$)/)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1 class="text-2xl font-bold mt-8 mb-4">${line.replace(/^# /, '')}</h1>`;
        continue;
      }

      // Numbered lists
      if (line.match(/^\d+\.\s+(.*$)/)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += '</ul>';
          html += '<ol class="list-decimal list-inside space-y-1 my-2 ml-4">';
          inList = true;
          listType = 'ol';
        }
        html += `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
        continue;
      }

      // Bullet points
      if (line.match(/^[\*\-]\s+(.*$)/)) {
        if (!inList || listType !== 'ul') {
          if (inList) html += '</ul>';
          html += '<ul class="list-disc list-inside space-y-1 my-2 ml-4">';
          inList = true;
          listType = 'ul';
        }
        html += `<li>${line.replace(/^[\*\-]\s+/, '')}</li>`;
        continue;
      }

      // Empty lines or regular text
      if (line.trim() === '') {
        if (inList) {
          html += '</ul>';
          inList = false;
          listType = '';
        }
        continue;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
          listType = '';
        }
        // Regular paragraph
        html += `<p class="mb-3">${line}</p>`;
      }
    }

    // Close any open list
    if (inList) {
      html += '</ul>';
    }

    // Final cleanup and formatting
    return html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>');
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

    // Hide download button when starting new query
    downloadPdf.style.display = 'none';

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
        // Puter.ai returns: { message: { content: "text" }, ... }
        responseText = response.message?.content || response.content || response.text || response.data;

        // If still not a string, stringify the object
        if (typeof responseText !== 'string') {
          responseText = JSON.stringify(response, null, 2);
        }
      } else {
        responseText = 'No response received from AI service';
      }

      const parsedResponse = parseMarkdownToHTML(responseText);

      // Display response with animation
      responseBox.innerHTML = parsedResponse;
      responseBox.style.animation = 'fadeIn 0.6s ease-out';

      // Show download button
      downloadPdf.style.display = 'flex';

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

  // PDF Download functionality
  downloadPdf.addEventListener('click', async () => {
    try {
      // Show loading state
      const originalText = downloadPdf.innerHTML;
      downloadPdf.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating PDF...';
      downloadPdf.disabled = true;

      // Create PDF content
      const pdfContent = createPDFContent(queryInput.value);

      // Generate PDF with proper options
      const opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right margins (reduced)
        filename: `LawAI_Analysis_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff' // Ensure white background
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(pdfContent).save();

      // Reset button
      downloadPdf.innerHTML = originalText;
      downloadPdf.disabled = false;

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');

      // Reset button
      downloadPdf.innerHTML = '<i class="fas fa-download mr-2"></i>Download PDF';
      downloadPdf.disabled = false;
    }
  });

  // Function to create PDF content
  function createPDFContent(originalQuery) {
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = `
      font-family: 'Times New Roman', serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000000;
      background-color: #ffffff;
      max-width: 190mm;
      margin: 0;
      padding: 0;
      width: 100%;
      box-sizing: border-box;
    `;

    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 10px;
      margin-bottom: 15px;
      page-break-after: avoid;
    `;

    const title = document.createElement('h1');
    title.textContent = 'LawAI Legal Analysis Report';
    title.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #000000;
      font-family: 'Times New Roman', serif;
    `;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Intelligent Legal Assistant for Law Enforcement';
    subtitle.style.cssText = `
      font-size: 12px;
      color: #333333;
      margin: 0 0 8px 0;
      font-family: 'Times New Roman', serif;
    `;

    const date = document.createElement('p');
    date.textContent = `Generated on: ${new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    date.style.cssText = `
      font-size: 10px;
      color: #666666;
      margin: 0;
      font-family: 'Times New Roman', serif;
    `;

    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(date);

    // Add original query section
    const querySection = document.createElement('div');
    querySection.style.cssText = `
      margin-bottom: 15px;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 3px;
      border: 1px solid #dddddd;
      page-break-inside: avoid;
    `;

    const queryTitle = document.createElement('h2');
    queryTitle.textContent = 'Original Query';
    queryTitle.style.cssText = `
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #000000;
      border-bottom: 1px solid #cccccc;
      padding-bottom: 3px;
      font-family: 'Times New Roman', serif;
    `;

    const queryText = document.createElement('p');
    queryText.textContent = originalQuery || 'N/A';
    queryText.style.cssText = `
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: #000000;
      font-family: 'Times New Roman', serif;
    `;

    querySection.appendChild(queryTitle);
    querySection.appendChild(queryText);

    // Add analysis section
    const analysisSection = document.createElement('div');
    analysisSection.style.cssText = `margin-bottom: 15px;`;

    const analysisTitle = document.createElement('h2');
    analysisTitle.textContent = 'Legal Analysis Results';
    analysisTitle.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 12px 0;
      color: #000000;
      border-bottom: 1px solid #cccccc;
      padding-bottom: 5px;
      font-family: 'Times New Roman', serif;
      page-break-after: avoid;
    `;

    analysisSection.appendChild(analysisTitle);

    // Clone and clean the response content
    const responseClone = responseBox.cloneNode(true);

    // Remove any interactive elements or styling that won't work in PDF
    const buttons = responseClone.querySelectorAll('button');
    buttons.forEach(button => button.remove());

    const links = responseClone.querySelectorAll('a');
    links.forEach(link => {
      link.style.color = '#000';
      link.style.textDecoration = 'underline';
    });

    // Apply PDF-friendly styling - ensure all text is visible
    responseClone.style.cssText = `
      font-family: 'Times New Roman', serif;
      font-size: 11px;
      line-height: 1.4;
      color: #000000;
      background-color: #ffffff;
    `;

    // Style headers - ensure visibility
    const headers = responseClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      header.style.fontFamily = "'Times New Roman', serif";
      header.style.fontWeight = 'bold';
      header.style.marginTop = '12px';
      header.style.marginBottom = '6px';
      header.style.color = '#000000';
      header.style.pageBreakAfter = 'avoid';
    });

    // Style lists
    const lists = responseClone.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.style.margin = '6px 0';
      list.style.paddingLeft = '15px';
      list.style.color = '#000000';
    });

    const listItems = responseClone.querySelectorAll('li');
    listItems.forEach(item => {
      item.style.marginBottom = '3px';
      item.style.color = '#000000';
    });

    // Style paragraphs
    const paragraphs = responseClone.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.style.margin = '6px 0';
      p.style.textAlign = 'justify';
      p.style.color = '#000000';
    });

    // Style strong/bold text
    const strongElements = responseClone.querySelectorAll('strong, b');
    strongElements.forEach(strong => {
      strong.style.color = '#000000';
      strong.style.fontWeight = 'bold';
    });

    // Style emphasis/italic text
    const emphasisElements = responseClone.querySelectorAll('em, i');
    emphasisElements.forEach(em => {
      em.style.color = '#000000';
      em.style.fontStyle = 'italic';
    });

    // Style code blocks
    const codeBlocks = responseClone.querySelectorAll('pre');
    codeBlocks.forEach(code => {
      code.style.background = '#f5f5f5';
      code.style.padding = '8px';
      code.style.border = '1px solid #cccccc';
      code.style.borderRadius = '2px';
      code.style.fontSize = '9px';
      code.style.overflow = 'visible';
      code.style.whiteSpace = 'pre-wrap';
      code.style.wordWrap = 'break-word';
      code.style.color = '#000000';
      code.style.margin = '8px 0';
    });

    const inlineCode = responseClone.querySelectorAll('code');
    inlineCode.forEach(code => {
      if (!code.closest('pre')) {
        code.style.background = '#f0f0f0';
        code.style.padding = '1px 3px';
        code.style.borderRadius = '2px';
        code.style.fontSize = '10px';
        code.style.color = '#000000';
      }
    });

    analysisSection.appendChild(responseClone);

    // Add footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #666;
    `;

    const disclaimer = document.createElement('p');
    disclaimer.innerHTML = `
      <strong>Disclaimer:</strong> This analysis is generated by AI and should not be considered legal advice.
      Always consult with qualified legal professionals for official legal matters.
      Generated by LawAI - Intelligent Legal Assistant.
    `;
    disclaimer.style.cssText = `
      margin: 0;
      line-height: 1.3;
    `;

    footer.appendChild(disclaimer);

    // Assemble the PDF
    pdfContainer.appendChild(header);
    pdfContainer.appendChild(querySection);
    pdfContainer.appendChild(analysisSection);
    pdfContainer.appendChild(footer);

    return pdfContainer;
  }

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