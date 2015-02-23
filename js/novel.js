
function LoadChapterTitles(chapterlist) {
  // load chapter titles
  innerHtml = '';
  if (chapterlist) {
    // load article
    novel_name = chapterlist[0].title;
    innerHtml = '<h1>' + novel_name + '</h1>';
    // update titile
    window.document.title = novel_name;
    $('.novel_title').html(innerHtml);

    innerHtml = '<ul class="chapter_list">';
    for (i=1; i < chapterlist.length; ++i) {
      var chapter = chapterlist[i];
      innerHtml += '<ol class="chapter_item">';
      link = '<a href="#' + i.toString() + '" class="';
      link += 'chapter_item';
      if (chapter.hasRead) {
        link += ' chapter_item_read ';
      }
      link += '">';
      link += chapter.title + '</a>';

      innerHtml += link;
      innerHtml += '</ol>';
    }
    innerHtml += '</ul>';
  } else {
    innerHtml = '<h1>Not Found</h1>';
  }
  $('.novel_chapter').html(innerHtml);
}

function LoadChapterContent(chapterlist) {
  // load chapter titles
  innerHtml = '';
  if (chapterlist) {
    for (i=1; i < chapterlist.length; ++i) {
      var chapter = chapterlist[i];
      innerHtml += '<hr class="split_chapter" />';
      innerHtml += '<div class="chapter_content" id="' +
        i.toString() + '" name="' + i.toString() + '">';
      innerHtml += '<a href="#" class="nav_return_top">返回顶部</a>';
      innerHtml += '<h2>' + chapter.title + '</h2>';
      innerHtml += '<div class="chapter_text"></div>';
      innerHtml += '</div>';
    }
  } else {
    innerHtml = '<h1>Not Found</h1>';
  }
  $('.novel_content').html(innerHtml);
}

$(document).ready(function() {
  url = localStorage.getItem("current_ContentPage");
  chapterlist = JSON.parse(localStorage.getItem(url));

  LoadChapterTitles(chapterlist);

  LoadChapterContent(chapterlist);
})

function LoadContentOnline() {
  url = localStorage.getItem("current_ContentPage");
  chapterlist = JSON.parse(localStorage.getItem(url));
  if (chapterlist) {
    for (i=1; i < chapterlist.length; ++i) {
    //for (i=1; i < 1000; ++i) {
      var chapter = chapterlist[i];
      var target_id = 'div#' + i.toString() + ' .chapter_text';
      var html = '正在加载: ' + chapter.title;
      $('.loading_tips').html(html);
      parseBody(chapter, target_id);
    }
  }
  $('.loading_tips').hide();
}


setTimeout(LoadContentOnline, 1000);

