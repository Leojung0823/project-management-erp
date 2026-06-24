document.addEventListener('readystatechange', function () {
  if (document.readyState === 'complete' && window.TRELLO && window.TRELLO.init) {
    window.TRELLO.init();
  }
});
