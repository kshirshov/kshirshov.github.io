// Check URL parameters and update content accordingly
function checkUninstallParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const isUninstall = urlParams.has('uninstall');
    
    const title = document.querySelector('h1');
    const description = document.querySelector('.feedback-description');
    const catImage = document.querySelector('.feedback-cat');
    
    if (!isUninstall) {
        // Default content for regular visitors - motivating without sad connotation
        title.textContent = 'Share Ideas';
        description.textContent = 'Suggestions and feedback directly influence new features and improvements that benefit the entire community.';
        
        // Hide the cat image for regular visitors and show Web Store block instead
        if (catImage) {
            catImage.style.display = 'none';
        }
        
        const webStoreBlock = document.querySelector('.webstore-block');
        if (webStoreBlock) {
            webStoreBlock.style.display = 'flex';
        }
    } else {
        // For uninstall visitors - hide Web Store block and show cat
        const webStoreBlock = document.querySelector('.webstore-block');
        if (webStoreBlock) {
            webStoreBlock.style.display = 'none';
        }
    }
    // If uninstall parameter exists, keep current content (no changes needed)
}

// Update Twitter link with custom text
function updateTwitterLink(event) {
    event.preventDefault();
    
    // TEMP DEBUG: Function called
    console.log('🔄 updateTwitterLink called');
    
    // Get tweet text and analyze user engagement
    const highlightDiv = document.getElementById('highlightDiv');
    const textarea = document.getElementById('tweetText');
    const tweetText = highlightDiv ? highlightDiv.innerText : textarea.value;
    
    // Check if user customized the default text
    const defaultText = 'I would like @QNTB_EXT to have...';
    const hasCustomText = tweetText.trim() !== defaultText.trim();
    
    // Check if this is uninstall feedback context
    const urlParams = new URLSearchParams(window.location.search);
    const isUninstall = urlParams.has('uninstall');
    
    // TEMP DEBUG: Event parameters
    console.log('📊 Event params:', {
        feedback_context: isUninstall ? 'ext_uninstall' : 'organic',
        text_customized: hasCustomText,
        gtag_available: typeof gtag !== 'undefined'
    });
    
    // TEMP DEBUG: Record start time for measuring callback performance
    const startTime = performance.now();
    
    // Send feedback event to Google Analytics
    if (typeof gtag !== 'undefined') {
        // TEMP DEBUG: Check GA4 readiness
        const isGA4Ready = gtag.toString().includes('dataLayer.push') === false;
        console.log('🔍 GA4 readiness check:', {
            gtag_available: typeof gtag !== 'undefined',
            dataLayer_exists: typeof dataLayer !== 'undefined',
            dataLayer_length: dataLayer ? dataLayer.length : 0,
            isGA4Ready: isGA4Ready,
            gtag_toString: gtag.toString().substring(0, 50)
        });
        
        console.log('📤 Sending GA4 event...', { startTime: startTime });
        
        // Use callback only if GA4 is fully ready
        if (isGA4Ready) {
            console.log('✨ GA4 ready - using callback approach');
            gtag('event', 'feedback', {
                'feedback_context': isUninstall ? 'ext_uninstall' : 'organic',
                'text_customized': hasCustomText
            }, {
                'event_callback': function() {
                    // TEMP DEBUG: Callback fired
                    console.log('✅ GA4 callback fired (success or timeout)');
                    console.log('📋 GA4 callback details:', {
                        timestamp: new Date().toISOString(),
                        elapsedTime: Math.round(performance.now() - startTime) + 'ms'
                    });
                    // Redirect to Twitter
                    redirectToTwitter(tweetText);
                },
                'event_timeout': 350 // Increased timeout for better reliability
            });
        } else {
            console.log('⏳ GA4 not ready - using fallback approach');
            // Send event without callback and redirect with delay
            gtag('event', 'feedback', {
                'feedback_context': isUninstall ? 'ext_uninstall' : 'organic',
                'text_customized': hasCustomText
            });
            
            // Give GA4 time to send the event, then redirect
            setTimeout(() => {
                console.log('🕐 Fallback redirect after 300ms delay');
                redirectToTwitter(tweetText);
            }, 300);
        }
    } else {
        // TEMP DEBUG: GA not available
        console.log('❌ GA4 not available - immediate redirect');
        // If GA is not available, redirect immediately
        redirectToTwitter(tweetText);
    }
}

// Helper function to redirect to Twitter
function redirectToTwitter(tweetText) {
    // TEMP DEBUG: Redirect function called
    console.log('🐦 redirectToTwitter called', { 
        tweetLength: tweetText.length 
    });
    
    const encodedText = encodeURIComponent(tweetText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // TEMP DEBUG: About to open Twitter
    console.log('🚀 Opening Twitter URL:', twitterUrl.substring(0, 100) + '...');
    
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
}

// Save cursor position
function saveCursorPosition(element) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }
    return 0;
}

// Restore cursor position
function restoreCursorPosition(element, position) {
    const selection = window.getSelection();
    const range = document.createRange();
    
    let currentPos = 0;
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent.length;
        
        if (currentPos + nodeLength >= position) {
            range.setStart(node, position - currentPos);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }
        currentPos += nodeLength;
    }
}

// Simple highlighting function using contenteditable div
function applyHighlighting() {
    const textarea = document.getElementById('tweetText');
    let text = textarea.value;
    
    // Create a temporary div to render highlighted HTML
    const highlightDiv = document.getElementById('highlightDiv');
    if (!highlightDiv) {
        // Create highlight div if it doesn't exist
        const div = document.createElement('div');
        div.id = 'highlightDiv';
        div.className = 'highlight-div';
        div.contentEditable = true;
        textarea.parentNode.insertBefore(div, textarea);
        textarea.style.display = 'none';
        
        // Add input listener only once
        div.addEventListener('input', function() {
            const cursorPos = saveCursorPosition(div);
            textarea.value = div.innerText;
            

            
            // Update highlighting
            let highlightedText = div.innerText
                .replace(/@([a-zA-Z0-9_]+)/g, '<span style="color: var(--twitter-mention);">@$1</span>')
                .replace(/#([a-zA-Z0-9_]+)/g, '<span style="color: var(--twitter-mention);">#$1</span>')
                .replace(/\n/g, '<br>');
            
            div.innerHTML = highlightedText;
            restoreCursorPosition(div, cursorPos);
        });
    }
    
    const div = document.getElementById('highlightDiv');
    
    // Replace mentions and hashtags with colored spans
    let highlightedText = text
        .replace(/@([a-zA-Z0-9_]+)/g, '<span style="color: var(--twitter-mention);">@$1</span>')
        .replace(/#([a-zA-Z0-9_]+)/g, '<span style="color: var(--twitter-mention);">#$1</span>')
        .replace(/\n/g, '<br>');
    
    div.innerHTML = highlightedText;
}

// Initialize textarea
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters and update content
    checkUninstallParameter();
    
    const textarea = document.getElementById('tweetText');
    
    // Initial highlighting
    applyHighlighting();
    
    // Set cursor position after "have" in the highlight div
    setTimeout(() => {
        const highlightDiv = document.getElementById('highlightDiv');
        if (highlightDiv) {
            const text = highlightDiv.innerText;
            const cursorPosition = text.indexOf('have') + 4;
            
            // Set cursor position in contenteditable div
            const range = document.createRange();
            const sel = window.getSelection();
            
            // Find the text node and set cursor position
            const walker = document.createTreeWalker(
                highlightDiv,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let currentPos = 0;
            let targetNode = null;
            let targetOffset = 0;
            
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;
                
                if (currentPos + nodeLength >= cursorPosition) {
                    targetNode = node;
                    targetOffset = cursorPosition - currentPos;
                    break;
                }
                currentPos += nodeLength;
            }
            
            if (targetNode) {
                range.setStart(targetNode, targetOffset);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                highlightDiv.focus();
            }
        }
    }, 100);
}); 