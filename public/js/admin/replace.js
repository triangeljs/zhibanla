(function ($) {
    $('#startName').on('change', function () {
        var startName = $(this).val();
        if (startName != 0) {
            $.ajax({
                url: '',
                method: 'put',
                data: { "startName": startName },
                success: function (list) {
                    setReplaceDate(list);
                }
            });
        }
    });

    $('.notelDel').on('click', function () {
        if (confirm("您确定要删除该条值班调换？")) {
            var id = $(this).parent().parent().data('id');
            $.ajax({
                url: '',
                method: 'delete',
                data: { "id": id },
                success: function (data) {
                    if (data.ok == 1) {
                        location.replace(location.href);
                    }
                }
            });
        }
    });

    function setReplaceDate(data) {
        var len = data.length;
        var temp = ['<option value="0" select>值班日期</option>'];
        for (var i = 0; i < len; i++) {
            temp.push('<option value="' + data[i].batch + '" select>' + data[i].time_fmt + '</option>');
        }
        $('#replaceDate').html(temp.join(''));
    }
})(jQuery);