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
        //innerHtml += '<td>' + historylist[i].url + '</td>';
        innerHtml += '<td>&nbsp;<span class="td_remove" hidden '
          + 'id="' + historylist[i].id + '" '
          + '>' + 'Remove' + '</span></td>';
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
      $('span.td_remove').click(function() {
        delHistory($(this).attr('id'));
        $(this).parent().parent().remove();
      });
      $('span.book_item').click(function() {
        readNovel($(this).attr('id'));
      });
    }
  });
}

function delHistory(id) {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].id == id) {
          historylist.splice(i,1);
          break;
        }
      }
      storage.set({'history': JSON.stringify(historylist)});
    }
  });
}

function cleanAllHistory() {
/*  alert(chrome.i18n.getMessage("extension_ConfirmcleanAllHistory"));
  var ret = confirm(chrome.i18n.getMessage("extension_ConfirmcleanAllHistory"));
  if (true == ret) {
    storage.remove('history');
    $('#hostory_list').html('');
  }
  */
  storage.remove('history');
  $('#hostory_list').html('');

  historylist = JSON.parse("[]");
  storage.set({'history': JSON.stringify(historylist)});
}

$(document).ready(function() {
  // init
  init();

  // add event to readit
  $('#readit').click(function() {
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
  });
});

function verifyNovelContentUrl(url) {
  if (!url) {
    return false;
  }

  storage.get('support_website', function(items) {
    var weblist = '';
    if (items.support_website) {
      support_weblist = JSON.parse(items.support_website);
      for (i = 0; i < support_weblist.length; ++i) {
        if (i > 0) weblist += ',';
        weblist += support_weblist[i].url;
      }
    } else {
      var website_list = JSON.parse("[]");
      var web={"title":"起点中文网", "url":"qidian.com"};
      website_list.push(web);
      weblist += web.url;
      storage.set({'support_website': JSON.stringify(website_list)});
    }
    $('#valid_website').text(weblist);
  });

  var text = $('#valid_website').text();
  weblist = text.split(',');
  for (i = 0; i < weblist.length; ++i) {
    web = weblist[i];
    if (-1 != url.indexOf(web)) {
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
  innerHtml = '<b>' + chrome.i18n.getMessage("extension_supportWeb") + '</b>';
  storage.get('support_website', function(items) {
    if (items.support_website) {
      innerHtml += '<ul>';
      support_weblist = JSON.parse(items.support_website);
      for (i = 0; i < support_weblist.length; ++i) {
        var web = support_weblist[i].title;
        var href = support_weblist[i].url;
        if (-1 == href.indexOf('://')) {
          href = 'http://' + href;
        }
        var weblink = '<a href="' + href + '">' + web + '</a>';
        innerHtml += '<li>' + weblink + '</li>';
      }
      innerHtml += '</ul>';
    }
    $('#view_supported_website').html(innerHtml);
  });
}

function init() {
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

  $('#clean_all_histories').click(function() {
    cleanAllHistory();
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
}

