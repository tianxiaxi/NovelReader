// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//var storage = chrome.storage.sync;
var storage = chrome.storage.local;

function getHistoryList() {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      innerHtml = '<table class="table_history">';
      for (i=0; i < historylist.length; ++i) {
        innerHtml += '<tr class="tr_history">';
        article = historylist[i].article;
        if (historylist[i].chapter) {
          article += ' (' + historylist[i].chapter + ')';
        }
        innerHtml += '<td>' + article + '</td>';
        innerHtml += '<td>' + historylist[i].url + '</td>';
        innerHtml += '<td>&nbsp;<span class="td_remove" hidden '
          + 'id="' + historylist[i].id.toString() + '" '
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
}

function setCurrentUrl(url) {
  storage.set({'current_url': url});
}

$(document).ready(function() {
  // init
  init();

  // add event to readit
  $('#readit').click(function() {
    novel_url = $('#req_read_url').attr('value');
    setCurrentUrl(novel_url);

    //tab_url = "../views/read.html";
    tab_url = chrome.extension.getURL('views/read.html');
    chrome.tabs.create({
      'url': tab_url,
      'selected': true
    });
    window.close();
  });
});

function init() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var current = tabs[0];
    $('#req_read_url').attr('value', current.url);
  });

  $('#clean_all_histories').click(function() {
    cleanAllHistory();
  });

  // reset label
  $('#req_content').text(chrome.i18n.getMessage("extension_inputContentTitle"));
  $('#readit').text(chrome.i18n.getMessage("extension_ReadIt"));
  $('#read_history_title').text(chrome.i18n.getMessage("extension_HistoryLabel"));
  $('#clean_all_histories').text(chrome.i18n.getMessage("extension_cleanAllHistory"));

  // load history
  getHistoryList();
}

