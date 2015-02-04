var storage = chrome.storage.sync;
var local = chrome.storage.local;

function LoadChapterTitles(url) {
  // parse chapters
  chapterlist = JSON.parse(localStorage.getItem(url));
  if (!chapterlist.length) {
    parseChapterTitles(url);
    chapterlist = JSON.parse(localStorage.getItem(url));
  }

  // load article
  storage.get('history', function(items) {
    innerHtml = '';
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].contentPage == url) {
          article = historylist[i].article;
          innerHtml = '<h1>' + article + '</h1>';
          // update titile
          window.document.title = article;
          break;
        }
      }
    } else {
      //innerHtml = '<h1>Not Found</h1>';
    }
    $('#novel_title').html(innerHtml);
  });

  // load chapter titles
  innerHtml = '';
  //chapterlist = JSON.parse(localStorage.getItem(url));
  if (chapterlist) {
    innerHtml = '<ul>';
    for (i=0; i < chapterlist.length; ++i) {
      var chapter = chapterlist[i];
      innerHtml += '<ol>';
      link = '<a href="../views/read.html" class="';
      link += 'chapter_item';
      if (chapter.hasRead) {
        link += ' chapter_item_read ';
      }
      link += '" ';
      link += 'id="' + chapter.url + '"';
      link += '>' + chapter.title + '</a>';
      innerHtml += link;
      innerHtml += '</ol>';
    }
    innerHtml += '</ul>';
  } else {
    innerHtml = '<h1>Not Found</h1>';
  }
  $('#novel_text').html(innerHtml);

  // insert nav
  var nav_html = '<b>' + chrome.i18n.getMessage("extension_viewSource") + '</b>';
  nav_html += '<a href="' + url + '">' + url + '</a>';
  $('#novel_nav').html(nav_html);
}

$(document).ready(function() {
  current_url = localStorage.getItem("current_ContentPage");
  LoadChapterTitles(current_url);

  $('a.chapter_item').click(function() {
    url = $(this).attr('id');
    localStorage.setItem("current_chapter", url);
  });
})

