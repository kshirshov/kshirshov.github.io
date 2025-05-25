// Update Twitter link with custom text
function updateTwitterLink(event) {
    event.preventDefault();
    const highlightDiv = document.getElementById('highlightDiv');
    const textarea = document.getElementById('tweetText');
    
    // Get text from highlight div if it exists, otherwise from textarea
    const tweetText = highlightDiv ? highlightDiv.innerText : textarea.value;
    const encodedText = encodeURIComponent(tweetText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
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