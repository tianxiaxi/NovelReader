var storage = chrome.storage.sync;
var local = chrome.storage.local;

var content_url = localStorage.getItem("current_ContentPage");

function LoadChapterTitles() {
  url = localStorage.getItem("current_ContentPage");
  // parse chapters
  chapterlist = JSON.parse(localStorage.getItem(url));

  // load chapter titles
  innerHtml = '';
  if (chapterlist) {
    // load article
    novel_name = chapterlist[0].title;
    innerHtml = '<h1>' + novel_name + '</h1>';
    innerHtml += '<a href="../views/novel.html">全文阅读</a>';
    // update titile
    window.document.title = novel_name;
    $('#novel_title').html(innerHtml);

    innerHtml = '<ul class="chapter_list">';
    for (i=1; i < chapterlist.length; ++i) {
      var chapter = chapterlist[i];
      innerHtml += '<ol class="chapter_item">';
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

  $('a.chapter_item').click(function() {
    url = $(this).attr('id');
    localStorage.setItem("current_chapter", url);
    localStorage.setItem("current_ContentPage", content_url);
  });
}

$(document).ready(function() {
  current_url = localStorage.getItem("current_ContentPage");
  if (!localStorage[current_url]) {
    parseChapterUrl();
  }
})

function Loading() {
  current_url = localStorage.getItem("current_ContentPage");
  if (!localStorage[current_url]) {
    setTimeout(Loading, 1000);
  } else {
    LoadChapterTitles();
  }
}
setTimeout(Loading, 1000);
