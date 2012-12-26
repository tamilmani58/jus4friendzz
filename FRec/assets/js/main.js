chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {height: 728, width: 960});
});