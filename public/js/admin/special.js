(function ($) {
    $("#specialDate").attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' }).dateDropper();

    $('.specialDel').on('click', function () {
        var self = $(this);
        if (confirm("您确定要删除该条特殊值班？")) {
            var specialID = self.parent().parent().data('id');
            $.ajax({
                url: '',
                method: 'DELETE',
                data: { id: specialID },
                success: function (result) {
                    if (result.ok == 1) {
                        location.replace(location.href);
                    }
                }
            });
        }
    });

    var defaultTitle = '';
    $('.itemTitle').on('click', function () {
        defaultTitle = $(this).text();
    }).on('focusout', function () {
        var curTitle = $(this).text();
        if (defaultTitle != curTitle) {
            var specialID = $(this).parent().data('id'),
                specialTime = $(this).siblings('.itemDate').attr('data-ts'),
                specialTitle = $(this).text(),
                specialUsers = $.trim($(this).siblings('.itemUsers').text());

            $.ajax({
                url: '',
                method: 'put',
                data: { "id": specialID, "specialTime": specialTime, "specialTitle": specialTitle, "specialUsers": specialUsers },
                success: function (result) {
                    //console.log(result);
                }
            });
        }
    });

    var lock = true;
    $('.itemUsers').on('click', function (e) {
        lock = false;
        var targetUser = $.trim($(this).find('h2').text()).split(',');
        var targetUserTemp = '', selectUserTemp = '';
        for (var i = 0; i < targetUser.length; i++) {
            if (targetUser[i] != '') {
                targetUserTemp += '<span>' + targetUser[i] + '</span>';
            }
        }
        $('#userList li').each(function () {
            selectUserTemp += '<li>' + $(this).text() + '</li>';
        });
        $(this).find('.selectTag').remove();
        $(this).append('<div id="selectTag" class="selectTag"><div class="targetName">' + targetUserTemp + '</div><ul class="selectName">' + selectUserTemp + '</ul></div>');
    }).on('mouseleave', function () {
        var curUser = [];
        var defaultUsers = $(this).find('h2');
        $(this).find('.targetName span').each(function () {
            curUser.push($(this).text());
        });
        //if(curUser)
        if (!lock) {
            $(this).find('h2').text(curUser.join(','));
        }
        $(this).find('.selectTag').remove();
        var curusers = $(this).text();
        if (defaultUsers != curusers) {
            var specialID = $(this).parent().data('id'),
                specialTime = $(this).siblings('.itemDate').attr('data-ts'),
                specialTitle = $.trim($(this).siblings('.itemTitle').text()),
                specialUsers = $.trim($(this).find('h2').text());

            $.ajax({
                url: '',
                method: 'put',
                data: { "id": specialID, "specialTime": specialTime, "specialTitle": specialTitle, "specialUsers": specialUsers },
                success: function (result) {
                    //console.log(result);
                }
            });
        }
        lock = true;
    });

    $('.itemUsers').on('click', '.targetName span', function () {
        $(this).remove();
        return false;
    });
    $('.itemUsers').on('click', '.selectName li', function () {
        var curName = $(this).text();
        $('.targetName').append('<span>' + curName + '</span>');
        return false;
    });
})(jQuery);