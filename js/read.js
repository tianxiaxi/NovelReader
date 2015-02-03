var storage = chrome.storage.sync;
var local = chrome.storage.local;

function loadBody(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var html = xhr.response;
      ipos = url.indexOf('qidian.com');
      if (-1 != ipos) {
        parseChapterContent_qidian(url, html);
      }
    }
  }
  xhr.send();
}

function parseChapterContent_qidian(url, html) {
  ipos = html.indexOf('<script');
  while (ipos > 0) {
    html = html.substr(ipos+1);
    ilast = html.indexOf('>');
    if (ilast > 0) {
      src = html.substr(0, ilast);
      pos = src.indexOf('src');
      if (pos > 0) {
        src = src.substr(pos + 1);
        pos = src.indexOf('"');
        if (pos > 0) src = src.substr(pos + 1);
        pos = src.indexOf('"');
        if (pos > 0) src = src.substr(0, pos);
        pos = src.indexOf("'");
        if (pos > 0) src = src.substr(pos + 1);
        pos = src.indexOf("'");
        if (pos > 0) src = src.substr(0, pos);
        if (-1 != src.indexOf('files.qidian.com') &&
          -1 != src.indexOf('.txt')) {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", src, false);
          xhr.overrideMimeType("text/html;charset=gb2312");
          xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
              text = xhr.response;
              text = text.replace("document.write('", "");
              text = text.replace("');", "");
              $('#novel_text').html(text);
            }
          }
          xhr.send();
          return ;
        }
      }
    }
    html = html.substr(ilast+1);
    ipos = html.indexOf('<script');
  }

  doc = $.parseHTML(html);
  $("[charset]", doc).each(function() {
    src = $(this).attr('src');
    if (src) {
      console.log(src);
    }
  })
  innerHtml = '';
  book = $('.bookcontent', html);
  $('#novel_text').text(book.text());
}

function LoadContent() {
  content_url = localStorage.getItem("current_ContentPage");
  url = localStorage.getItem("current_chapter");
  chapterlist = JSON.parse(localStorage.getItem(content_url));
  if (!chapterlist.length) {
    parseChapterTitles(url);
    chapterlist = JSON.parse(localStorage.getItem(content_url));
  }

  // update header
  prev_chater_url = '';
  next_chater_url = '';
  chapter_name = '';
  innerHtml = '<h1>Not Found</h1>';
  for (i=0; i < chapterlist.length; ++i) {
    var chapter = chapterlist[i];
    if (chapter.url == url) {
      chapter_name = chapter.title;
      innerHtml = '<h1>' + chapter_name + '</h1>';
      if (i > 0) prev_chater_url = chapterlist[i-1].url;
      if (i < chapterlist.length-1) next_chater_url = chapterlist[i+1].url;
      break;
    }
  }
  $('#novel_title').html(innerHtml);

  // update html body
  loadBody(url);

  // update title
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].contentPage == content_url) {
          historylist[i].url = url;
          historylist[i].chapter = chapter_name;
          title = historylist[i].article;
          window.document.title = title;
          storage.set({'history': JSON.stringify(historylist)});
          break;
        }
      }
    }
  });

  // update navigition
  if (!prev_chater_url) {
    // previous chapter
    $('.prev_chapter').hide();
  }
  if (!next_chater_url) {
    // next chapter
    $('.next_chapter').hide();
  }
  $('.prev_chapter').click(function() {
    localStorage.setItem("current_chapter", prev_chater_url);
    location.reload();
  });
  $('.next_chapter').click(function() {
    localStorage.setItem("current_chapter", next_chater_url);
    location.reload();
  });
  $('.back_content').click(function() {
    window.location.href = '../views/chapters.html';
  });

  // update foot page
  var foot_page = '<b>' + chrome.i18n.getMessage("extension_viewSource") + '</b>';
  foot_page += '<a href="' + url + '">' + url + '</a>';
  $('#current_url').html(foot_page);
}

$(document).ready(function() {
  LoadContent();
})

