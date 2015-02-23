// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var storage = chrome.storage.sync;
var local = chrome.storage.local;

function getHistoryList() {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      if (!historylist.length) {
        return ;
      }

      $('div#read_history').show();
      innerHtml = '<table class="table_history">';
      for (i=0; i < historylist.length; ++i) {
        innerHtml += '<tr class="tr_history">';
        article = historylist[i].article;
        if (historylist[i].chapter) {
          article += ' (' + historylist[i].chapter + ')';
        }
        label = '<span id="' + historylist[i].id + '" ';
        label += 'class="book_item">' + article + '</span>';
        innerHtml += '<td>' + label + '</td>';
        innerHtml += '</tr>';
      }
      innerHtml += '</table>';
      $('#hostory_list').html(innerHtml);

      $('.table_history tr.tr_history').mouseenter(function() {
        $(this).find('.td_remove').removeAttr('hidden');
      });
      $('.table_history tr.tr_history').mouseleave(function() {
        $(this).find('.td_remove').attr('hidden', true);
      });
      $('span.book_item').click(function() {
        readNovel($(this).attr('id'));
      });
    }
  });
}

$(document).ready(function() {
  // init
  init();
});

function verifyNovelContentUrl(url) {
  if (!url) {
    return false;
  }
  var text = $('#valid_website').text();
  weblist = text.split(',');
  for (i = 0; i < weblist.length; ++i) {
    domain_url = weblist[i];
    if (domain_url.length < 1) {
      continue;
    }
    if (-1 != url.indexOf(domain_url)) {
      return true;
    }
  }
  return false;
}

function readNovel(id) {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].id == id) {
          content_page = historylist[i].contentPage;
          chapter_body = historylist[i].url;
          localStorage.setItem("current_ContentPage", content_page);
          localStorage.setItem("current_chapter", chapter_body);
          tab_url = chrome.extension.getURL('views/read.html');
          if (chapter_body == content_page) {
            tab_url = chrome.extension.getURL('views/chapters.html');
          }
          chrome.tabs.create({
            'url': tab_url,
            'selected': true
          });
          window.close();
          return ;
        }
      }
    }
  });
}

function viewSupportWebsite() {
  var website_file = chrome.extension.getURL('websiteList.json');
  $.get(website_file, function(data) {
    var weblist_html = "";
    weblist_html = '<b>' + chrome.i18n.getMessage("extension_supportWeb") + '</b>';
    var file_json = JSON.parse(data);
    var weblist = file_json.websiteList;
    weblist_html += '<ul>';
    for (i = 0; i < weblist.length; ++i) {
      var web = weblist[i];
      if (!web.enabled) {
        continue;
      }
      home_page = '<a href="' + web.home_page + '">' + web.name_chn + '</a>';
      weblist_html += '<li>' + home_page + '</li>';
    }
    weblist_html += "</ul>";
    $('#view_supported_website').html(weblist_html);
  })
}

function init() {
  // load supported website list
  var website_file = chrome.extension.getURL('websiteList.json');
  $.get(website_file, function(data) {
    var weblist_html = "";
    var file_json = JSON.parse(data);
    var weblist = file_json.websiteList;
    for (i = 0; i < weblist.length; ++i) {
      if (!weblist[i].enabled) {
        continue;
      }
      weblist_html += weblist[i].domain_url;
      weblist_html += ',';
    }
    $('#valid_website').text(weblist_html);
  })

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var current = tabs[0];
    if (verifyNovelContentUrl(current.url)) {
      $('#req_read_url').attr('value', current.url);
    }
  });

  $('#view_supported_website').click(function() {
    viewSupportWebsite();
    $(this).unbind('click');
    $(this).attr('class', '');
  });

  $('#view_histories, #ext_setting').click(function() {
    tab_url = chrome.extension.getURL('views/options.html');
    chrome.tabs.create({
      'url': tab_url,
      'selected': true
    });
    window.close();
  });

  // reset label
  $('#req_content').text(chrome.i18n.getMessage("extension_inputContentTitle"));
  $('#readit').text(chrome.i18n.getMessage("extension_ReadIt"));
  $('#read_history_title').text(chrome.i18n.getMessage("extension_HistoryLabel"));
  $('#clean_all_histories').text(chrome.i18n.getMessage("extension_cleanAllHistory"));
  $('#view_supported_website').text(chrome.i18n.getMessage("extension_supportWeb"));

  // load history
  $('div#read_history').hide();
  getHistoryList();

  // add event to readit
  $('#readit').click(readit);
}

function readit() {
  var novel_url = $('#req_read_url').val();
  if (!verifyNovelContentUrl(novel_url)) {
    $('#err_message').text(chrome.i18n.getMessage("extension_InvalidUrl"));
  } else {
    localStorage.setItem("current_ContentPage", novel_url);
    //parseChapterTitles(novel_url);
    tab_url = chrome.extension.getURL('views/chapters.html');
    chrome.tabs.create({
      'url': tab_url,
      'selected': true
    });
    window.close();
  }
}

