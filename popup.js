// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function setChildTextNode(elementId, text) {
  document.getElementById(elementId).innerText = text;
}

function setNodeValue(elementId, text) {
  document.getElementById(elementId).value = text;
}

function getId(elementId) {
  return document.getElementById(elementId);
}

function init() {
  //setChildTextNode('languageSpan', chrome.i18n.getMessage("@@ui_locale"));
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var current = tabs[0];
    req_url = getId('req_read_url');
    req_url.value = current.url;   
  });
}

function getAcceptLanguages() {
  chrome.i18n.getAcceptLanguages(function(languageList) {
    var languages = languageList.join(",");
    setChildTextNode('languageSpan',
        chrome.i18n.getMessage("chrome_accept_languages", languages));
  })
}

document.addEventListener('DOMContentLoaded', function() {
  init();
});
