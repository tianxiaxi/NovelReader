//var storage = chrome.storage.sync;
var storage = chrome.storage.local;

function addHistory(article, chapter, url) {
  storage.get('history', function(items) {
    if (items.history) {
      var max_id = 0;
      var bInsert = true;
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].id > max_id) {
          max_id = historylist[i].id;
        }

        // update item
        if (historylist[i].article == article) {
          historylist[i].chapter = chapter;
          historylist[i].url = url;
          bInsert = false;
          break;
        }
      }
    } else {
      historylist = JSON.parse("[]");
    }

    if (bInsert) {
      max_id += 1;
      var item = new Object;
      item.id = max_id;
      item.article = article;
      item.chapter = chapter;
      item.url = url;
      historylist.unshift(item);
    }
    storage.set({'history': JSON.stringify(historylist)});
  });
}

function getCurrentUrl() {
  storage.get('current_url', function(items) {
    if (items.current_url) {
      url = items.current_url;
      $('#current_url').text(url);
    }
  });
}

$(document).ready(function() {
  getCurrentUrl();

  $('#storage_history').click(function() {
    addHistory('baidu', 'news', 'http://www.baidu.com');
    addHistory('163', 'blog', 'http://www.163.com');
    addHistory('google', 'search', 'http://www.google.com');
    addHistory('gmail', 'email', 'http://www.gmail.com');
  });
})

