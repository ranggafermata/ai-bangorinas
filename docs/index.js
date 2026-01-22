// This is the complete, final, and corrected index.js

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. All Variable Declarations ---
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const responseBox = document.getElementById('response-box');
  const box = responseBox;
  const yearSpan = document.getElementById('year');
  const mediaPreviewContainer = document.getElementById('media-preview-container');
  const mediaItems = document.getElementById('media-items');
  const fileInput = document.getElementById('file-input');
  const micBtn = document.getElementById('mic-btn');
  const API_BASE = window.API_URL || window.location.origin;

  let attachedFiles = []; // Array to store multiple files
  let conversationHistory = [];
  let currentSessionId = null; //

  // --- Microphone Recording Variables ---
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    try { recognition.processLocally = true; } catch(e) { /* not all browsers expose this */ }
  }

  // Model selection and personas
  let currentModel = 'qwen/qwen-2.5-vl-7b-instruct:free'; // Default model
  let currentModelName = 'A1'; // Default model name

  const modelConfigs = {
    'A1': {
      id: 'qwen/qwen-2.5-vl-7b-instruct:free',
      persona: `You are A1, a cool and friendly AI assistant with a vibrant personality part of Bangorinas AI family. You're creative, witty, and always ready to help with any question or task. Your style is conversational and engaging - you make complex topics easy to understand, and you're never afraid to add a bit of humor or personality to your responses. You're knowledgeable across many domains and always aim to provide clear, helpful, and accurate information. Be yourself, be helpful, and make the conversation enjoyable!`
    },
    'Verve': {
      id: 'allenai/molmo-2-8b:free',
      persona: `You are Verve, Bangorinas' energetic and enthusiastic alter-ego. You bring intense passion and determination to every conversation. You're ambitious, driven, and always pushing boundaries to find the best solutions. Your energy is contagious - you inspire people to think bigger and aim higher. You excel at breaking down complex problems into actionable steps and motivating others to achieve their goals. You're direct, focused, and always ready for a challenge. Let your zeal shine through in every response!`
    },
    'Verve Pro': {
      id: 'nvidia/nemotron-nano-12b-v2-vl:free',
      useReasoning: true,
      persona: `You are Verve Pro, the ultimate version of Bangorinas' most powerful AI companion part of the Bangorinas AI family. You embody advanced reasoning and deep analytical prowess combined with Verve's energetic passion. You don't just provide answers—you uncover hidden connections, break down complex problems with remarkable clarity, and think several steps ahead. Your reasoning is transparent and insightful. You inspire action through wisdom and strategic thinking. You're relentless in pursuing excellence and never settle for surface-level solutions. Every response demonstrates your superior analytical capabilities and determination to deliver exceptional value. Push boundaries. Think deeper. Achieve more!`
    }
  };

  // Model switching functions - make them global for HTML onclick
  window.effort = function() {
    currentModel = modelConfigs['A1'].id;
    currentModelName = 'A1';
    document.getElementById('currentModelBadge').textContent = 'A1 Power';
    console.log('Switched to A1 model');
  };

  window.endeavor = function() {
    currentModel = modelConfigs['Verve'].id;
    currentModelName = 'Verve';
    document.getElementById('currentModelBadge').textContent = 'Verve';
    console.log('Switched to Verve model');
  };

  window.pro = function() {
    currentModel = modelConfigs['Verve Pro'].id;
    currentModelName = 'Verve Pro';
    document.getElementById('currentModelBadge').textContent = 'Verve Pro';
    console.log('Switched to Verve Pro model');
  };


  // --- 2. All Functions ---

  // Language Translation
  const translations = {
    en: { greeting: "Hello!", placeholder: "Ask anything...", recent: "Recent", noHistory: "No history yet", signInNotice: "Sign in to save your chat history and access personalized features." },
    id: { greeting: "Halo!", placeholder: "Tanyakan apa saja...", recent: "Terkini", noHistory: "Belum ada riwayat", signInNotice: "Masuk untuk menyimpan riwayat obrolan Anda dan mengakses fitur yang dipersonalisasi." },
    fr: { greeting: "Bonjour!", placeholder: "Demandez n'importe quoi...", recent: "Récents", noHistory: "Aucun historique", signInNotice: "Connectez-vous pour enregistrer votre historique de discussion et accéder à des fonctionnalités personnalisées." },
    es: { greeting: "Hola!", placeholder: "Pregunta cualquier cosa...", recent: "Reciente", noHistory: "Sin historia", signInNotice: "Inicie sesión para guardar su historial de chat y acceder a funciones personalizadas." },
    ru: { greeting: "Привет!", placeholder: "Спросите что угодно...", recent: "Недавние", noHistory: "Истории пока нет", signInNotice: "Войдите, чтобы сохранить историю чата и получить доступ к персональным функциям.." },
    uk: { greeting: "Привіт!", placeholder: "Запитайте що завгодно...", recent: "Недавні", noHistory: "Історії поки немає", signInNotice: "Увійдіть, щоб зберегти історію чату та отримати доступ до персоналізованих функцій." }
  };

  function changeLanguage(lang) {
    const langData = translations[lang];
    document.getElementById('chat-input').placeholder = langData.placeholder;
    document.querySelector('#sidebar h5').textContent = langData.recent;
    document.querySelector('#authNotice span').textContent = langData.signInNotice;
    const historyList = document.getElementById('chat-history');
    if (historyList.querySelector('li').textContent.includes('history') || historyList.querySelector('li').textContent.includes('riwayat') || historyList.querySelector('li').textContent.includes('historique') || historyList.querySelector('li').textContent.includes('historia') || historyList.querySelector('li').textContent.includes('Истории') || historyList.querySelector('li').textContent.includes('Історії')) {
        historyList.innerHTML = `<li>${langData.noHistory}</li>`;
    }
    const helloText = document.getElementById('hello-text');
    helloText.textContent = langData.greeting; // 1. Set the new text

    // 2. Force the animation to restart
    helloText.style.animation = 'none';
    helloText.offsetHeight; // This is a trick to trigger a DOM reflow
    helloText.style.animation = ''; // Reset the animation property

    // 3. Re-apply the animation with the correct number of steps for the new word
    const typingSpeed = 2; // in seconds
    const newSteps = langData.greeting.length;
    setTimeout(() => {
      helloText.style.animation = `typing ${typingSpeed}s steps(${newSteps}, end), blink-caret .75s step-end infinite`;
    }, 10);
  }
  // Make the function globally available for the HTML onclick attributes
  window.changeLanguage = changeLanguage;

  // Load Sidebar History
  async function loadSidebarHistory() {
    const historyList = document.getElementById("chat-history");
    historyList.innerHTML = ""; // Clear the list
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();
    // 1. Query the 'chats' collection to get a list of sessions
    const snapshot = await db.collection("chats")
      .where("uid", "==", user.uid)
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    if (snapshot.empty) {
      historyList.innerHTML = `<li>${translations[localStorage.getItem('preferredLanguage') || 'en'].noHistory}</li>`;
      return;
    }

    // 2. Create a list item for each session
    snapshot.forEach(doc => {
      const sessionData = doc.data();
      const entry = document.createElement("li");
      entry.textContent = sessionData.title || "Untitled Chat"; // Use the session title
      entry.style.cursor = "pointer";
      entry.dataset.sessionId = doc.id; // Store the session ID on the element

      // 3. When a session is clicked, load its entire history
      entry.onclick = async () => {
        const sessionId = entry.dataset.sessionId;
        console.log(`Loading session: ${sessionId}`);

        // Fetch all messages for this session
        const messagesSnapshot = await db.collection("chats").doc(sessionId).collection("messages").orderBy("timestamp").get();

        // Clear the current state
        box.innerHTML = "";
        conversationHistory = [];
        currentSessionId = sessionId;

        // Rebuild the conversation history and the UI
        messagesSnapshot.forEach(msgDoc => {
          const msgData = msgDoc.data();
          conversationHistory.push(msgData); // Add to local history

          // Create the chat bubble in the UI
          const bubble = document.createElement("div");
          bubble.className = `chat-bubble ${msgData.role} align-self-${msgData.role === 'user' ? 'end' : 'start'} text-light`;
          
          // Handle potential images in user messages
          if (msgData.role === 'user' && msgData.imageUrl) {
              const imgInChat = document.createElement('img');
              imgInChat.src = msgData.imageUrl;
              // ... (add styles for image) ...
              bubble.appendChild(imgInChat);
          }
          
          renderFormattedResponse(bubble, msgData.content);
          box.appendChild(bubble);
        });
        
        document.querySelector('main').classList.add('chat-active');
        box.scrollTop = box.scrollHeight;
      };
      historyList.appendChild(entry);
    });
  }

  // Helper function to apply markdown formatting to text
  function applyMarkdown(text) {
    const span = document.createElement('span');
    
    // Split by code blocks first (preserve them)
    const codeInlineRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeInlineRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'code', content: match[1] });
      lastIndex = codeInlineRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    // Process each part
    parts.forEach(part => {
      if (part.type === 'code') {
        const code = document.createElement('code');
        code.style.backgroundColor = '#2a2a2a';
        code.style.padding = '2px 6px';
        code.style.borderRadius = '3px';
        code.style.fontFamily = 'monospace';
        code.style.color = '#a8e6cf';
        code.textContent = part.content;
        span.appendChild(code);
      } else {
        // Apply bold, italic, and other markdown formatting
        let html = part.content
          .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>') // ***bold italic***
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // **bold**
          .replace(/\*(.+?)\*/g, '<em>$1</em>') // *italic*
          .replace(/__(.+?)__/g, '<strong>$1</strong>') // __bold__
          .replace(/_(.+?)_/g, '<em>$1</em>') // _italic_
          .replace(/~~(.+?)~~/g, '<del>$1</del>'); // ~~strikethrough~~
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Copy child nodes to preserve structure
        while (tempDiv.firstChild) {
          span.appendChild(tempDiv.firstChild);
        }
      }
    });
    
    return span;
  }

  // Render Formatted Response (with code blocks and markdown)
  function renderFormattedResponse(container, text) {
    container.innerHTML = '';
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const plainText = text.substring(lastIndex, match.index);
        const p = document.createElement('p');
        p.appendChild(applyMarkdown(plainText));
        p.style.margin = '0';
        container.appendChild(p);
      }
      
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      const header = document.createElement('div');
      header.className = 'code-block-header';
      const langSpan = document.createElement('span');
      langSpan.textContent = language;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.textContent = 'Copy Code';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 2000);
        });
      };
      header.appendChild(langSpan);
      header.appendChild(copyBtn);
      const pre = document.createElement('pre');
      const codeEl = document.createElement('code');
      codeEl.className = `language-${language}`;
      codeEl.textContent = code;
      pre.appendChild(codeEl);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
      container.appendChild(wrapper);
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      const p = document.createElement('p');
      p.appendChild(applyMarkdown(remainingText));
      p.style.margin = '0';
      container.appendChild(p);
    }
    
    Prism.highlightAll();
  }


  // --- 3. Executable Code & Event Listeners ---

  // Set footer year
  yearSpan.textContent = new Date().getFullYear();

  // Create and prepend the "New Chat" button
  const newChatBtn = document.createElement("button");
  newChatBtn.className = "btn btn-outline-light btn-sm mb-3 align-self-start";
  newChatBtn.textContent = "+ New Chat";
  newChatBtn.onclick = () => {
    document.querySelector('main').classList.remove('chat-active');
    box.innerHTML = "";
    chatInput.value = "";
    chatInput.style.height = 'auto';
    if (attachedFiles.length > 0) {
      attachedFiles = [];
      fileInput.value = '';
      mediaPreviewContainer.style.display = 'none';
      mediaItems.innerHTML = '';
    }
    conversationHistory = [];
    currentSessionId = null;
  };
  document.getElementById("chat-history").parentElement.prepend(newChatBtn);

  // Main form submission
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = chatInput.value.trim();
    if (!userInput && attachedFiles.length === 0) return;

    // --- Smart History Management (now in the frontend!) ---
    const MAX_TURNS = 4; // A turn is a user message and a bot response
    if (conversationHistory.length > MAX_TURNS * 2) {
        // Keep only the most recent messages
        conversationHistory = conversationHistory.slice(-(MAX_TURNS * 2));
        console.log(`History truncated to the last ${MAX_TURNS} turns.`);
    }

    // --- UI and History Update ---
    document.querySelector('main').classList.add('chat-active');
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    
    // Add user's message to the history *before* sending
    if (userInput) {
        conversationHistory.push({ role: 'user', content: userInput });
    }

    // --- Create User Bubble ---
    if (userInput || attachedFiles.length > 0) {
        const userBubble = document.createElement("div");
        userBubble.className = "chat-bubble user align-self-end text-light";
        if (attachedFiles.length > 0) {
            const mediaContainer = document.createElement('div');
            mediaContainer.style.display = 'flex';
            mediaContainer.style.flexWrap = 'wrap';
            mediaContainer.style.gap = '0.5rem';
            mediaContainer.style.marginBottom = userInput ? '0.5rem' : '0';
            
            attachedFiles.forEach(file => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                const mediaEl = isImage ? document.createElement('img') : document.createElement('video');
                const reader = new FileReader();
                reader.onload = (e) => {
                    mediaEl.src = e.target.result;
                };
                reader.readAsDataURL(file);
                mediaEl.style.maxWidth = '200px';
                mediaEl.style.maxHeight = '200px';
                mediaEl.style.borderRadius = '0.5rem';
                if (isVideo) {
                    mediaEl.controls = true;
                }
                mediaContainer.appendChild(mediaEl);
            });
            userBubble.appendChild(mediaContainer);
        }
        if (userInput) {
            const textNode = document.createElement('p');
            textNode.textContent = userInput;
            textNode.style.margin = '0';
            userBubble.appendChild(textNode);
        }
        box.appendChild(userBubble);
        box.scrollTop = box.scrollHeight;
    }
    

    // Build the messages array for the API with multimodal support
    // Start with system message for persona based on selected model
    const messages = [
        {
            role: 'system',
            content: modelConfigs[currentModelName].persona
        }
    ];

    // Add conversation history
    conversationHistory.slice(0, -1).forEach(msg => {
        if (msg.role === 'assistant') {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        } else {
            // For user messages, support both text and images
            const content = [];
            content.push({
                type: 'text',
                text: msg.content
            });
            messages.push({
                role: msg.role,
                content: content
            });
        }
    });

    // Add the current user message with multimodal support
    const userContent = [];
    userContent.push({
        type: 'text',
        text: userInput
    });

    // Add all attached files (images and videos)
    if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target.result.split(',')[1]);
                };
                reader.readAsDataURL(file);
            });

            if (isImage) {
                userContent.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:${file.type};base64,${base64Data}`
                    }
                });
            } else if (isVideo) {
                userContent.push({
                    type: 'video',
                    video: {
                        url: `data:${file.type};base64,${base64Data}`
                    }
                });
            }
        }
    }

    const userMessage = {
        role: 'user',
        content: userContent
    };
    messages.push(userMessage);

    // Build the request payload using current model
    const requestBody = {
        model: currentModel,
        messages: messages,
        stream: true
    };

    // Add reasoning if using Verve Pro
    if (modelConfigs[currentModelName].useReasoning) {
        requestBody.reasoning = { enabled: true };
    }

    chatInput.value = "";
    chatInput.style.height = 'auto';
    if (attachedFiles.length > 0) {
      attachedFiles = [];
      fileInput.value = '';
      mediaPreviewContainer.style.display = 'none';
      mediaItems.innerHTML = '';
    }

    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot align-self-start text-light";
    botBubble.innerHTML = '<span class="typing-dots">...</span>';
    box.appendChild(botBubble);
    box.scrollTop = box.scrollHeight;

    try {
        const res = await fetch(`${API_BASE}/api/chat`, { 
            method: 'POST', 
            headers: { 
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(requestBody)
        });
        if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        botBubble.innerHTML = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // Server-Sent Events might send multiple data chunks at once
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.substring(6);
                        if (jsonStr && jsonStr !== '[DONE]') {
                            const data = JSON.parse(jsonStr);
                            // OpenRouter uses choices[0].delta.content for streaming
                            const token = data.choices?.[0]?.delta?.content || '';
                            if (token) {
                                fullResponse += token;
                                
                                // Use renderFormattedResponse to handle potential Markdown in the full stream
                                renderFormattedResponse(botBubble, fullResponse + "▌"); // Add a cursor during streaming
                                box.scrollTop = box.scrollHeight;
                            }
                        }
                    } catch (e) {
                        console.error("Failed to parse JSON chunk:", line);
                    }
                }
            }
        }

        // Final render without the cursor
        renderFormattedResponse(botBubble, fullResponse);
        box.scrollTop = box.scrollHeight;
        
        conversationHistory.push({ role: 'assistant', content: fullResponse });

        // Save the full response to Firebase
        if (firebase.auth().currentUser) {
            const db = firebase.firestore();
            const user = firebase.auth().currentUser;
            const userMessage = {
                role: 'user',
                content: userInput,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
            const botMessage = {
                role: 'assistant',
                content: fullResponse,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (currentSessionId === null) {
                // This is the first message of a new session
                const newChatRef = await db.collection("chats").add({
                    uid: user.uid,
                    title: userInput.substring(0, 40), // Use first 40 chars of prompt as title
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                currentSessionId = newChatRef.id;
                // Save the first two messages
                await newChatRef.collection("messages").add(userMessage);
                await newChatRef.collection("messages").add(botMessage);
                loadSidebarHistory(); // Reload sidebar to show the new chat
            } else {
                // This is an existing session, just add the new messages
                const chatRef = db.collection("chats").doc(currentSessionId);
                await chatRef.collection("messages").add(userMessage);
                await chatRef.collection("messages").add(botMessage);
            }
        }
    } catch (error) {
      botBubble.textContent = "⚠️ Error: " + error.message;
      console.error("API Error:", error);
    }
  });

  // Other listeners
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = chatInput.scrollHeight + 'px';
  });

  chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
    }
  });

  document.getElementById("file-btn").addEventListener("click", () => {
    fileInput.click();
  });

  // Microphone button functionality
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      if (!recognition) {
        alert('Speech Recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      if (isRecording) {
        recognition.stop();
        isRecording = false;
        micBtn.style.opacity = '1';
        micBtn.style.backgroundColor = 'transparent';
      } else {
        isRecording = true;
        micBtn.style.opacity = '0.5';
        micBtn.style.backgroundColor = '#ff4444';
        recognition.start();
      }
    });

    // Speech Recognition Event Handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      // Add the recognized text to the chat input
      chatInput.value = transcript;
      chatInput.style.height = 'auto';
      chatInput.style.height = chatInput.scrollHeight + 'px';
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      micBtn.style.opacity = '1';
      micBtn.style.backgroundColor = 'transparent';
      isRecording = false;
      alert(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      micBtn.style.opacity = '1';
      micBtn.style.backgroundColor = 'transparent';
      isRecording = false;
    };
  }

  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      // Add new files to the array (allow up to 5 total)
      for (let i = 0; i < files.length && attachedFiles.length < 5; i++) {
        attachedFiles.push(files[i]);
      }
      
      // Update preview
      updateMediaPreview();
      mediaPreviewContainer.style.display = 'block';
    }
  });

  // Function to update media preview
  function updateMediaPreview() {
    mediaItems.innerHTML = '';
    attachedFiles.forEach((file, index) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      const mediaItem = document.createElement('div');
      mediaItem.className = 'media-item';
      
      if (isImage || isVideo) {
        const mediaEl = isImage ? document.createElement('img') : document.createElement('video');
        const reader = new FileReader();
        reader.onload = (e) => {
          mediaEl.src = e.target.result;
        };
        reader.readAsDataURL(file);
        mediaItem.appendChild(mediaEl);
        
        // Add file type badge
        const badge = document.createElement('span');
        badge.className = 'file-badge';
        badge.textContent = isImage ? 'IMG' : 'VID';
        mediaItem.appendChild(badge);
      }
      
      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-media-btn';
      removeBtn.textContent = '×';
      removeBtn.onclick = (e) => {
        e.preventDefault();
        attachedFiles.splice(index, 1);
        updateMediaPreview();
        if (attachedFiles.length === 0) {
          mediaPreviewContainer.style.display = 'none';
          fileInput.value = '';
        }
      };
      mediaItem.appendChild(removeBtn);
      mediaItems.appendChild(mediaItem);
    });
  }

  // --- 4. Initialization on Page Load ---
  
  // Sidebar hover/pin logic
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("pinned");
    if (sidebar.classList.contains("pinned")) {
      sidebar.classList.add("active");
    }
  });
  sidebar.addEventListener('mouseenter', () => {
    sidebar.classList.add('active');
  });
  sidebar.addEventListener('mouseleave', () => {
    if (!sidebar.classList.contains('pinned')) {
      sidebar.classList.remove('active');
    }
  });
  
  // Firebase Auth UI logic
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.onAuthStateChanged((user) => {
    const signin = document.getElementById('signinOption');
    const signout = document.getElementById('signoutOption');
    const info = document.getElementById('userInfo');
    if (user) {
      signin.classList.add('d-none');
      signout.classList.remove('d-none');
      info.classList.remove('d-none');
      info.innerHTML = `<strong>${user.displayName}</strong><br><small>${user.email}</small>`;
      loadSidebarHistory();
    } else {
      signin.classList.remove('d-none');
      signout.classList.add('d-none');
      info.classList.add('d-none');
      setTimeout(() => { document.getElementById('authNotice').style.display = 'block'; }, 1500);
    }
  });
  
  // Set initial language
  const savedLang = localStorage.getItem('preferredLanguage');
  if (savedLang) {
    changeLanguage(savedLang);
  } else {
    changeLanguage('en');
  }

});
