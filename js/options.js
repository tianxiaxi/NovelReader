$(document).ready(function() {
  LoadHistory();

  LoadWebsiteList();
})


function LoadHistory() {

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