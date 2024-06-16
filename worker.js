const state = {
  enabled: false,
}
chrome.action.onClicked.addListener((tab) => {
  if (state.enabled === false) {
    state.enabled = true
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['draw.js'],
    })
  }
})
