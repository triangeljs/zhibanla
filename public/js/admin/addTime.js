(function ($) {
    $('#holidayTime').attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' });
    $("#holidayTime").dateDropper();

    var webHeight = $('body').height();
    var headBox = $('.headBox').outerHeight(true);
    var addholidayForm = $('.addholidayForm').outerHeight(true);
    var holidayHead = $('.holidayHead').outerHeight(true);
    $('.holidayBox').height(webHeight - headBox - addholidayForm - holidayHead);
    $(window).resize(function () {
        webHeight = $('body').height();
        $('.holidayBox').height(webHeight - headBox - addholidayForm - holidayHead);
    });
})(jQuery);

(function ($) {
    var self = null;
    $('body').on('click', function (event) {
        self.removeClass('cur');
        $('#selectMenu').hide();
    });

    //调出右键菜单
    $('.operation').on('contextmenu', function (event) {
        self = $(this);
        self.addClass('cur').siblings().removeClass('cur');
        var xx = event.originalEvent.x || event.originalEvent.layerX || 0;
        var yy = event.originalEvent.y || event.originalEvent.layerY || 0;
        $('#selectMenu').css({ 'left': xx, 'top': yy }).show();
        return false;
    });

    //添加值班人员
    $('#selectMenu li').on('click', function () {
        var addUser = $(this).text();
        var id = self.data('id');
        $.get('../api', { 'action': 'edit', 'type': 'holiday', 'id': id, 'holidayUsers': addUser }, function (data) {
            if (data.code == 200) {
                self.find('td:last-child').append('<span>' + addUser + '</span>');
            } else {
                alert(data.message);
            }
        });
    });

    //删除值班人员
    $('.operation').on('click', 'span', function() {
        var self_cur = $(this);
        var user = self_cur.text();
        var id = self_cur.parent().parent().data('id');
        if(!confirm('确定要删除'+ user +'值班吗？')) {
            return false;
        }
        $.get('../api', { 'action': 'del_user', 'type': 'holiday', 'id': id, 'user': user }, function (data) {
            if (data.code == 200) {
                self_cur.remove();
            } else {
                alert(data.message);
            }
        });
    });

    //修改是否自动排班
    $('#selectMenu p span').on('click', function () {
        var editAuto = $(this).text();
        var id = self.data('id');
        $.get('../api', { 'action': 'auto', 'type': 'holiday', 'id': id, 'auto': editAuto }, function (data) {
            if (data.code == 200) {
                self.find('td:eq(3)').html(editAuto);
            } else {
                alert(data.message);
            }
        });
    });

    //删除节假日和特殊值班
    $('#selectMenu div span').on('click', function () {
        var str = $(this).text();
        var id = self.data('id');
        if(str == '否') {
            $('#selectMenu').hide();
            return false;
        }
        $.get('../api', { 'action': 'del', 'type': 'holiday', 'id': id }, function (data) {
            if (data.code == 200) {
                self.remove();
            } else {
                alert(data.message);
            }
        });
    });

})(jQuery);