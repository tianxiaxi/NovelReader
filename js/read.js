var storage = chrome.storage.sync;
var local = chrome.storage.local;

var oldKeyDown = document.onkeydown;
var content_url = localStorage.getItem("current_ContentPage");

function LoadContent() {
  url = localStorage.getItem("current_chapter");
  chapterlist = JSON.parse(localStorage.getItem(content_url));
  if (!chapterlist.length) {
    parseChapterTitles(url);
    chapterlist = JSON.parse(localStorage.getItem(content_url));
  }

  // update foot page
  var foot_page = '<b>' + chrome.i18n.getMessage("extension_viewSource") + '</b>';
  foot_page += '<a href="' + url + '">' + url + '</a>';
  $('#current_url').html(foot_page);

  // update header
  if (!chapterlist.length) {
    return ;
  }
  window.document.title = chapterlist[0].title;
  prev_chater_url = '';
  next_chater_url = '';
  chapter_name = '';
  innerHtml = '<h1>Not Found</h1>';
  for (i=1; i < chapterlist.length; ++i) {
    var chapter = chapterlist[i];
    if (chapter.url == url) {
      chapter.hasRead = true;
      chapter_name = chapter.title;
      innerHtml = '<h1>' + chapter_name + '</h1>';
      if (i > 1) {
        prev_chater_url = chapterlist[i-1].url;
      }
      if (i < chapterlist.length-1) {
        next_chater_url = chapterlist[i+1].url;
      }
      if (chapter.body || chapter.body.length <= 0) {
        parseBody(chapter, '#novel_text')
      }
      //$('#novel_text').html(chapter.body);
      break;
    }
  }
  localStorage.setItem(content_url, JSON.stringify(chapterlist));
  $('#novel_title').html(innerHtml);

  // update history
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        if (historylist[i].contentPage == content_url) {
          historylist[i].url = url;
          historylist[i].chapter = chapter_name;
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
    localStorage.setItem("current_ContentPage", content_url);
    location.reload();
  });
  $('.next_chapter').click(function() {
    localStorage.setItem("current_chapter", next_chater_url);
    localStorage.setItem("current_ContentPage", content_url);
    location.reload();
  });
  $('.back_content').click(function() {
    localStorage.setItem("current_ContentPage", content_url);
    window.location.href = '../views/chapters.html';
  });
}

$(document).ready(function() {
  LoadContent();

  oldKeyDown = document.onkeydown;
  document.onkeydown = onkeydown;
})

function onkeydown() {
  if ($('#chrome_ext_slideview_images_modal_dlg').is(":hidden")) {
    document.onkeydown = oldKeyDown;
    return ;
  }
  var keyCode = event.keyCode;
  if (37 == keyCode) {
    // prev
    if (!$('.prev_chapter').is(':hidden')) {
      localStorage.setItem("current_chapter", prev_chater_url);
    localStorage.setItem("current_ContentPage", content_url);
      location.reload();
    }
  } else if (39 == keyCode){
    // next
    if (!$('.next_chapter').is(':hidden')) {
      localStorage.setItem("current_chapter", next_chater_url);
    localStorage.setItem("current_ContentPage", content_url);
      location.reload();
    }
  } else if (13 == keyCode) {
    localStorage.setItem("current_ContentPage", content_url);
    window.location.href = '../views/chapters.html';
  }
}
