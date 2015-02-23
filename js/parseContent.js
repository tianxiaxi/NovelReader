function parseBody(chapter, target_id) {
  try {
    url = chapter.url;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var html = xhr.response;
        var website_file = chrome.extension.getURL('websiteList.json');
        $.get(website_file, function(data) {
          var file_json = JSON.parse(data);
          for (i = 0; i < file_json.websiteList.length; ++i) {
            var web = file_json.websiteList[i];
            if (!web.enabled) {
              continue;
            }
            ipos = url.indexOf(web.domain_url);
            if (-1 != ipos) {
              if (web.content_selector.length > 0) {
                parseChapterContent(chapter, html, web);
              } else {
                parseChapterContent_spec(chapter, html, web);
              }
              if (target_id) {
                $(target_id.toString()).html(chapter.body);
              }
              break;
            }
          }
        })
      }
    }
    xhr.send();
  }
  catch(e) {
    if (target_id) {
      $(target_id.toString()).html('Could not parse content');
    }
    console.log('try..catch: ' + e);
  }
  finally {
    console.log('failed to execute Ajax');
  }
}

function parseChapterContent(chapter, html, web) {
  for (i = 0; i < web.content_selector.length; ++i) {
    var content_selector = web.content_selector[i];
    var label_body = $(content_selector.toString(), html);
    if (label_body.length < 1) {
      continue;
    }
    label_body.find('div').remove();
    chapter.body = label_body.html();
    if (chapter.body.length > 0) {
      break;
    }
  }
}

function parseChapterContent_spec(chapter, html, web) {
  if (-1 != web.domain_url.indexOf('qidian.com')) {
    parseChapterContent_qidian(chapter, html, web);
  }

}

function parseChapterContent_qidian(chapter, html, web) {
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
              chapter.body = text;
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
}