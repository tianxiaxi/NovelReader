var storage = chrome.storage.sync;
var local = chrome.storage.local;

$(document).ready(function() {
  LoadHistory();

  LoadWebsiteList();

  $('.clear_all_history').click(function() {
    cleanAllHistory();
    $('#opt_sec_history .sec_body').remove();
  });
})


function LoadHistory() {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      if (!historylist.length) {
        return ;
      }

      innerHtml = '<table class="table_history">';
      innerHtml += '<thead><th>书名</th><th>章节名</th><th>删除</th></thead>';
      for (i=0; i < historylist.length; ++i) {
        item = historylist[i];
        innerHtml += '<tr class="tr_history">';
        td = '<a class="link_novel_chapter" href="../views/chapters.html" id="';
        td += item.contentPage + '">' + item.article + '</a>';
        innerHtml += '<td>' + td + '</td>';

        if (item.chapter.length > 0) {
          td = '<a class="link_novel_content" href="../views/read.html" id="';
          td += item.url + '" content_url="' + item.contentPage;
          td += '">' + item.chapter + '</a>';
        } else {
          td = '';
        }
        innerHtml += '<td>' + td + '</td>';

        td = '<span class="delete_history" id="' + item.id + '">Remove<span>';
        innerHtml += '<td>' + td + '</td>';

        innerHtml += '</tr>';
      }
      innerHtml += '</table>';
      $('#opt_sec_history .sec_body').html(innerHtml);

      $('.link_novel_chapter').click(function() {
        url = $(this).attr('id');
        localStorage.setItem("current_ContentPage", url);
      });
      $('.link_novel_content').click(function() {
        url = $(this).attr('id');
        content_url = $(this).attr('content_url');
        localStorage.setItem("current_chapter", url);
        localStorage.setItem("current_ContentPage", content_url);
      });

      $('.delete_history').click(function() {
        id = $(this).attr('id');
        delHistory(id);
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
          localStorage.removeItem(historylist[i].contentPage);
          historylist.splice(i,1);
          break;
        }
      }
      storage.set({'history': JSON.stringify(historylist)});
      location.reload();
    }
  });
}

function cleanAllHistory() {
  storage.get('history', function(items) {
    if (items.history) {
      historylist = JSON.parse(items.history);
      for (i=0; i < historylist.length; ++i) {
        localStorage.removeItem(historylist[i].contentPage);
      }
    }
  });

  historylist = JSON.parse("[]");
  storage.set({'history': JSON.stringify(historylist)});
}

function LoadWebsiteList() {
  var website_file = chrome.extension.getURL('websiteList.json');
  $.get(website_file, function(data) {
    var weblist_html = "";
    var file_json = JSON.parse(data);
    var weblist = file_json.websiteList;
    weblist_html = '<table class="supported_website_list">';
    weblist_html += '<thead><th>网站名称</th><th>网站首页</th></thead>';
    for (i = 0; i < weblist.length; ++i) {
      var web = weblist[i];
      if (!web.enabled) {
        continue;
      }
      weblist_html += '<tr>';
      weblist_html += '<td>' + web.name_chn + '</td>';
      home_page = '<a href="' + web.home_page + '">' + web.home_page + '</a>';
      weblist_html += '<td>' + home_page + '</td>';
      weblist_html += '<tr>';
    }
    weblist_html += "</table>";
    $('#opt_sec_weblist .sec_body').html(weblist_html);
  })
}