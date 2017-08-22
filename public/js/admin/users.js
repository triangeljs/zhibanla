(function ($) {
    var userName = '';
    $('.user_name').on('click', function () {
        userName = $(this).text();
    }).on('focusout', function () {
        var curName = $(this).text();
        if (userName != curName) {
            var userID = $(this).parent().data('id');
            editUser(userID);
        }
    });

    $('.user_jobs').on('click', function (e) {
        $(this).append('<ul class="selectTag"><li>设计</li><li>制作</li></ul>');
    }).on('mouseleave', function () {
        $(this).find('ul').remove();
    }).on('click', 'li', function (e) {
        e.stopPropagation();
        var val = $(this).parent().siblings('h2').text();
        var curVal = $(this).text();
        if (val != curVal) {
            $(this).parent().siblings('h2').text(curVal);
            var userID = $(this).parent().parent().parent().data('id');
            editUser(userID);
        }
        $(this).parent().remove();
    });

    $('.user_lock').on('click', function (e) {
        $(this).append('<ul class="selectTag"><li>是</li><li>否</li></ul>');
    }).on('mouseleave', function () {
        $(this).find('ul').remove();
    }).on('click', 'li', function (e) {
        e.stopPropagation();
        var val = $(this).parent().siblings('h2').text();
        var curVal = $(this).text();
        if (val != curVal) {
            $(this).parent().siblings('h2').text(curVal);
            var userID = $(this).parent().parent().parent().data('id');
            editUser(userID);
        }
        $(this).parent().remove();
    });

    $('.userDel').on('click', function () {
        var self = $(this);
        if (confirm("您要删除该人员？")) {
            var userID = self.parent().parent().data('id');
            $.ajax({
                url: '',
                method: 'DELETE',
                data: { id: userID },
                success: function (result) {
                    if (result.code == 200) {
                        self.parent().parent().remove();
                    }
                }
            });
        }
    });

    function editUser(ID) {
        var data = {}, curID;
        $('.usersList li').each(function () {
            curID = $(this).data('id');
            if (curID == ID) {
                data['userName'] = $.trim($(this).find('.user_name').text());
                data['jobs'] = $.trim($(this).find('.user_jobs h2').text());
                data['lock'] = $.trim($(this).find('.user_lock h2').text()) == '是' ? 'false' : 'true';
            }
        });
        $.ajax({
            url: '',
            method: 'put',
            data: { id: ID, userName: data.userName, jobs: data.jobs, lock: data.lock },
            success: function (result) {
                if (result.code != 200) {
                    location.replace();
                }
            }
        });
    }
})(jQuery);