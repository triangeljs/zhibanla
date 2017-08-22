(function ($) {
    $('#startTime').attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' });
    $("#startTime").dateDropper();

    $('.createBtn').on('click', function () {
        var time = $('#startTime').val();
        if(time == '') {
            alert('选择时间节点。')
            return false;
        }
        $.post('../index/', { 'time': time }, function (data) {
            console.log(data);
            var len = data.length;
            var str = [];
            for (var i = 0; i < len; i++) {
                str.push('<li><h2>' + data[i].title + '</h2><p>'+ getDate(data[i].time) +'</p><p>' + data[i].name + '</p></li>')
            }
            $('.jieguo').html('<ul class="zhibanbiao">'+ str.join('') +'</ul>');
        });
    });
})(jQuery);

function getDate(tm) {
    var date = new Date(tm);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var da = date.getDate();
    return year + '年' + month + '月' + da + '日';
} 