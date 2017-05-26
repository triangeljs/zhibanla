(function ($) {
    $('#startTime, #startTime_edit, #endTime, #endTime_edit').attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' });
    $("#startTime, #endTime").dateDropper();

    var webHeight = $('body').height();
    var headBox = $('.headBox').outerHeight(true);
    var userForm = $('.userForm').outerHeight(true);
    var usersHead = $('.usersHead').outerHeight(true);
    $('.userBox').height(webHeight - headBox - userForm - usersHead);
    $(window).resize(function () {
        webHeight = $('body').height();
        $('.userBox').height(webHeight - headBox - userForm - usersHead);
    });
})(jQuery);

(function ($) {
    var self = null;
    $('body').on('click', function (event) {
        if (self) {
            self.removeClass('cur');
        }
        $('#selectMenu').hide();
    });

    //调出右键菜单
    $('.operation').on('contextmenu', function (event) {
        self = $(this);
        self.addClass('cur').siblings().removeClass('cur');
        var targetX = event.originalEvent.x || event.originalEvent.layerX || 0;
        var targetY = event.originalEvent.y || event.originalEvent.layerY || 0;
        $('#selectMenu').css({ 'left': targetX, 'top': targetY }).show();
        return false;
    });

    //修改单条信息
    $('#selectMenu p span').on('click', function () {
        var str = $(this).text();
        var id = self.data('id');
        var userName = self.find('.n').text();
        var jobs = self.find('.j').text();
        var startTime = self.find('.st').text();
        var cacheStartTime = startTime.split('-');
        var endTime = self.find('.et').text();
        var cacheEndTime = endTime.split('-');

        if (str == '否') {
            $('#selectMenu').hide();
            self.removeClass('cur');
            return false;
        }

        $('.editUserBox').show();
        $('#userName_edit').val(userName);
        $('#startTime_edit').val(startTime).attr({ 'data-default-date': cacheStartTime[1] + '-' + cacheStartTime[2] + '-' + cacheStartTime[0] }).dateDropper();
        $('#endTime_edit').val(endTime).attr({ 'data-default-date': cacheEndTime[1] + '-' + cacheEndTime[2] + '-' + cacheEndTime[0] }).dateDropper();
        $('#jobs_edit').val(jobs);
        $('#userId').val(id);
    });

    $('.editUserBox .edit').on('click', function () {
        var userName = $('#userName_edit').val();
        var startTime = $('#startTime_edit').val();
        var endTime = $('#endTime_edit').val();
        var jobs = $('#jobs_edit').val();
        var id = $('#userId').val();
        console.log(userName + '|' + startTime + '|' + endTime + '|' + jobs + '|' + id);

        $.get('../api', { 'action': 'edit', 'type': 'users', 'id': id, 'userName': userName, 'startTime': startTime, 'endTime': endTime, 'jobs': jobs }, function (data) {
            if (data.code == 200) {
                window.location.reload();
            } else {
                alert(data.message);
            }
        });
    });
    $('.editUserBox .esc').on('click', function () {
        $('.editUserBox').hide();
    });

    //删除单条信息
    $('#selectMenu div span').on('click', function () {
        var str = $(this).text();
        var id = self.data('id');
        if (str == '否') {
            $('#selectMenu').hide();
            self.removeClass('cur');
            return false;
        }
        $.get('../api', { 'action': 'del', 'type': 'users', 'id': id }, function (data) {
            if (data.code == 200) {
                self.remove();
            } else {
                alert(data.message);
            }
        });
    });

})(jQuery);