var version = '1.0';
function onAttach(tabId, windowId) {
  if (chrome.runtime.lastError) {
    alert(chrome.runtime.lastError.message);
    return;
  }

  chrome.windows.create(
      {url: 'index.html?' + tabId + '&windowId=' + windowId, type: 'popup', width: 800, height: 600});
}
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.debugger.attach({tabId:tab.id}, version,
      onAttach.bind(null, tab.id, tab.windowId));
});