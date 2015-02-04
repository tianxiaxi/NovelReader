var storage = chrome.storage.sync;
var local = chrome.storage.local;

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
      item.contentPage = url;
      historylist.unshift(item);
    }
    storage.set({'history': JSON.stringify(historylist)});
  });
}

function parseChapterTitles(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var html = $.parseHTML(xhr.response);
      ipos = url.indexOf('qidian.com');
      if (-1 != ipos) {
        parseChapterTitles_qidian(url, html);
      }
    }
  }
  xhr.send();
}

function parseChapterTitles_qidian(url, html) {
  base_url = url;
  ipos = url.lastIndexOf('.');
  if (-1 != ipos) {
    base_url = url.substr(0, ipos);
  }

  // get novel name
  h1 = $('h1', html);
  h1.children().each(function() {
    $(this).remove();
  });
  novel_name = h1.text();
  if (!novel_name) {
    return false;
  }

  // get chapters
  var chapter_list = JSON.parse("[]");
  $('a', html).each(function() {
    title = $(this).text();
    href = $(this).attr('href');
    if (url == href) {
      return ;  // current page
    }
    if (-1 == href.indexOf(base_url)) {
      return ;  // not content page
    }

    var item = new Object;
    item.title = title;
    item.url = href;
    item.hasRead = false;
    item.body = '';
    chapter_list.push(item);
  });

  if (0 >= chapter_list.length) {
    return false;
  }

  // save history
  addHistory(novel_name, '', url);

  // insert chapters
  localStorage.setItem(url, JSON.stringify(chapter_list));

  return true;
}

