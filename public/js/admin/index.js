(function ($) {
    var date = new Date();
    var targetYear = 2017;
    var curYear = date.getFullYear();
    var len = curYear - targetYear + 1;
    var temp = [];
    for (var i = 0; i <= len; i++) {
        temp.push('<li>' + (targetYear + i) + '</li>');
    }
    $('#selectYear h1').text(curYear);
    $('#selectYear ul').html(temp.join(''));

    $('#selectYear').on('mouseenter', function () {
        $(this).find('ul').show();
    });
    $('#selectYear').on('mouseleave', function () {
        $(this).find('ul').hide();
    });
    $('#selectYear li').on('click', function () {
        var str = $(this).text();
        $('#selectYear h1').text(str);
        $('#selectYear ul').hide();
    });

    $('.createBtn').on('click', function () {
        var year = $('#selectYear h1').text();
        $.post('../index/', { 'year': year }, function (data) {
            if (data.code != 200) {
                alert(data.message);
                return;
            }
            var len = data.jsonData.list.length;
            var temp = [];
            for (var i = 0; i < len; i++) {
                temp.push('<li>' + data.jsonData.list[i].startTime + ':' + data.jsonData.list[i].content + ':' + data.jsonData.list[i].users.join(',') + '</li>');
            }
            $('.jieguo').html('<ul class="zhibanbiao">' + temp.join('') + '</ul>');
        });
    });

    $('.statistics').on('click', function () {
        var year = $('#selectYear h1').text();
        $.get('../api', { 'action': 'get', 'type': 'zhibanla', 'year': year }, function (data) {
            if (data.code == 200) {
                var jieguo = tongji(data);
                var temp = '';
                for (var i in jieguo) {
                    temp += '<li><h2>'+ i +'</h2><p>节日：'+ jieguo[i].jier +'</p><p>周末：'+ jieguo[i].zhoumo +'</p></li>';
                }
                $('.jieguo').html('<ul class="tongji">'+ temp +'</ul>');
            } else {
                alert(data.message);
            }
        });
    });

    function tongji(data) {
        var len = data.list.length;
        var uLen = data.users.length;
        var obj = new Object();
        for (var j = 0; j < uLen; j++) {
            obj[data.users[j].userName] = {
                'jier': 0,
                'zhoumo': 0
            }
        }
        for (var i = 0; i < len; i++) {
            if (data.list[i].content == '周六值班' || data.list[i].content == '周日值班') {
                for (var k = 0, kLen = data.list[i].users.length; k < kLen; k++) {
                    obj[data.list[i].users[k]].zhoumo = obj[data.list[i].users[k]].zhoumo + 1;
                }
            } else {
                for (var k = 0, kLen = data.list[i].users.length; k < kLen; k++) {
                    obj[data.list[i].users[k]].jier = obj[data.list[i].users[k]].jier + 1;
                }
            }
        }
        return obj;
    }

})(jQuery);