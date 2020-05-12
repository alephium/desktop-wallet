function openWallet() {
  browser.tabs.create({
    "url": "/wallet.html"
  });
}

browser.browserAction.onClicked.addListener(openWallet);
