(function ($) {
    $('#startTime').attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' });
    $("#startTime").dateDropper();

    var webHeight = $('body').height();
    var headBox = $('.headBox').outerHeight(true);
    var addjustForm = $('.addjustForm').outerHeight(true);
    var justHead = $('.justHead').outerHeight(true);
    $('.justBox').height(webHeight - headBox - addjustForm - justHead);
    $(window).resize(function () {
        webHeight = $('body').height();
        $('.justBox').height(webHeight - headBox - addjustForm - justHead);
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

    //删除单条信息
    $('#selectMenu div span').on('click', function () {
        var str = $(this).text();
        var id = self.data('id');
        if(str == '否') {
            $('#selectMenu').hide();
            return false;
        }
        $.get('../api', { 'action': 'del', 'type': 'just', 'id': id }, function (data) {
            if (data.code == 200) {
                self.remove();
            } else {
                alert(data.message);
            }
        });
    });
})(jQuery);