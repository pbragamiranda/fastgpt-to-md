document.addEventListener('DOMContentLoaded', function () {
  const copyButton = document.getElementById('copyButton');

  copyButton.addEventListener('click', async () => {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (activeTab && activeTab.url.startsWith("https://kagi.com/fastgpt?query=")) {
      try {
        const result = await executeScriptInTab(activeTab.id);
        copyResultToClipboard(result);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  function executeScriptInTab(tabId) {
    return new Promise((resolve) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: grabContent,
        args: []
      }, (result) => {
        resolve(result[0]["result"]);
      });
    });
  }

  function copyResultToClipboard(result) {
    turndownService = new TurndownService();
    const markdownContent = turndownService.turndown(result);

    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        console.log('Text copied to clipboard successfully');
      })
      .catch((error) => {
        console.error('Error copying text to clipboard:', error);
      });
  }

  function grabContent() {
    const main = document.querySelector('.content');
    const question = document.querySelector('input[name="query"]').value;

    if (!main) {
      return 'not found';
    }

    const h3Element = main.querySelector('h3');
    if (h3Element) {
      h3Element.parentNode.removeChild(h3Element);
    }

    const formattedContent = `
    <h2>Question</h2><br>${question}<h2>Answer</h2><br>${main.outerHTML}
    `;

    return formattedContent;
  }

});
