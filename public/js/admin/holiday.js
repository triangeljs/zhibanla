(function ($) {
    $("#holidayDate").attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' }).dateDropper();

    var holidayName = '';
    $('.holiday_name').on('click', function () {
        holidayName = $(this).text();
    }).on('focusout', function () {
        var curTItle = $(this).text();
        if (holidayName != curTItle) {
            var holidayID = $(this).parent().data('id');
            editHoliday(holidayID);
        }
    });

    $('.holiday_lock').on('click', function (e) {
        $(this).append('<ul class="selectTag"><li>是</li><li>否</li></ul>');
    }).on('mouseleave', function () {
        $(this).find('ul').remove();
    }).on('click', 'li', function (e) {
        e.stopPropagation();
        var val = $(this).parent().siblings('h2').text();
        var curVal = $(this).text();
        if (val != curVal) {
            $(this).parent().siblings('h2').text(curVal);
            var holidayID = $(this).parent().parent().parent().data('id');
            editHoliday(holidayID);
        }
        $(this).parent().remove();
    });

    $('.holidayDel').on('click', function () {
        var self = $(this);
        if (confirm("您要删除该假日？")) {
            var holidayID = self.parent().parent().data('id');
            $.ajax({
                url: '',
                method: 'DELETE',
                data: { id: holidayID },
                success: function (result) {
                    if (result.code == 200) {
                        location.replace(location.href);
                    }
                }
            });
        }
    });

    function editHoliday(ID) {
        var data = {}, curID;
        $('.holidayList li').each(function () {
            curID = $(this).data('id');
            if (curID == ID) {
                data['holidayName'] = $.trim($(this).find('.holiday_name').text());
                data['lock'] = $.trim($(this).find('.holiday_lock h2').text()) == '是' ? 'false' : 'true';
            }
        });
        $.ajax({
            url: '',
            method: 'put',
            data: { id: ID, holidayName: data.holidayName, lock: data.lock },
            success: function (result) {
                if (result.code != 200) {
                    location.replace();
                }
            }
        });
    }
})(jQuery);