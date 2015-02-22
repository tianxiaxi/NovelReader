var storage = chrome.storage.sync;

function addHistory(article, chapter, url) {
  sessionStorage.setItem('HasHistory', false);
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
    sessionStorage.setItem('HasHistory', true);
  });
  hasHistory = sessionStorage.getItem('HasHistory');
  if (!hasHistory) {
      historylist = JSON.parse("[]");
      var item = new Object;
      item.id = 1;
      item.article = article;
      item.chapter = chapter;
      item.url = url;
      item.contentPage = url;
      historylist.unshift(item);
      storage.set({'history': JSON.stringify(historylist)});
  }
}

function parseChapterUrl() {
  url = localStorage.getItem("current_ContentPage");
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var html = $.parseHTML(xhr.response);
      var website_file = chrome.extension.getURL('websiteList.json');
      $.get(website_file, function(data) {
        var file_json = JSON.parse(data);
        var weblist = file_json.websiteList;
        for (i = 0; i < weblist.length; ++i) {
          var web = weblist[i];
          if (-1 != url.indexOf(web.domain_url)) {
            parseChapterTitles(url, html, web);
          }
        }
      })
    }
  }
  xhr.send();
}

function parseChapterTitles(url, html, web) {
  // get novel name
  novel_name = '';
  for (i = 0; i < web.title_selector.length; ++i) {
    var title_selector = web.title_selector[i];
    var label_h1 = $(title_selector.toString(), html);
    if (label_h1.length < 1) {
      continue;
    }
    novel_name = label_h1.text();
    if (novel_name.length > 0) {
      break;
    }
  }
  if (!novel_name.length) {
    return false;
  }

  // get chapters
  var chapter_list = JSON.parse("[]");
  for (i = 0; i < web.chapter_selector.length; ++i) {
    var chapter_selector = web.chapter_selector[i];
    var label = $(chapter_selector.toString(), html);
    label.each(function() {
      var title = $(this).text();
      var href = $(this).attr('href');
      if (-1 == href.indexOf(url)) {
        href = web.home_page + href;
      }

      var item = new Object;
      item.title = title;
      item.url = href;
      item.hasRead = false;
      item.body = '';
      chapter_list.push(item);
    })
    if (chapter_list.length > 0) {
      break;
    }
  }

  if (0 >= chapter_list.length) {
    return false;
  }

  // save history
  addHistory(novel_name, '', url);

  // insert chapters
  var item = new Object;
  item.title = novel_name;
  item.url = url;
  item.hasRead = false;
  item.body = '';
  chapter_list.unshift(item);
  localStorage.setItem(url, JSON.stringify(chapter_list));

  //location.reload();

  return true;
}

//parseChapterUrl();