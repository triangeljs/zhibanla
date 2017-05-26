(function ($) {
    var myDate = new Date(),
        year = myDate.getFullYear(),
        calendarData = null,
        noteData = null;
    var bodyHeight = $('body').outerHeight(true),
        headBoxHeight = $('.headBox').outerHeight(true),
        toolBoxHeight = $('.toolBox').outerHeight(true),
        calendarTitleHeight = $('.calendarTitle').outerHeight(true);

    $.get('', { 'year': year }, function (data) {
        calendarData = data.list;
        noteData = data.note;
        create_calendar();
        setBody();
        calendar_Effect();
        //statistical();
    });

    $(window).resize(function () {
        bodyHeight = $('body').outerHeight(true);
        setBody();
    });

    function setBody() {
        $('.calendarWrap').height(bodyHeight - headBoxHeight - toolBoxHeight - calendarTitleHeight);
        $('.calendarWrap').each(function () {
            var len = $(this).find('ul').length;
            var h = (bodyHeight - headBoxHeight - toolBoxHeight - calendarTitleHeight) / len;
            $(this).find('li').height(h);
        });
        var len = $('.calendarWrap ul').length;
    }

    function calendar_Effect() {
        var current_month = myDate.getMonth();
        var arrCur = current_month;
        $('.calendarWrap').hide().eq(current_month).show();
        $('.selectBox h2').text(year + '年' + (current_month + 1) + '月');
        $('.selectBox li').eq(current_month).addClass('cur');
        $('.calendarBody li').each(function () {
            if ($(this).find('.n').text() == '周六值班' || $(this).find('.n').text() == '周日值班') {
                $(this).addClass('zhoumo');
            }
            if ($(this).find('.n').text() && $(this).find('.n').text() != '周六值班' && $(this).find('.n').text() != '周日值班' && $(this).find('.u').text() != '') {
                $(this).addClass('jiejiar');
            }
        });

        $('.previousBtn').on('click', function () {
            arrCur = arrCur - 1;
            if (arrCur < 0) {
                arrCur = 0;
            }
            $('.calendarWrap').hide().eq(arrCur).show();
            $('.selectBox h2').text(year + '年' + (arrCur + 1) + '月');
        });

        $('.nextBtn').on('click', function () {
            arrCur = arrCur + 1;
            if (arrCur > 11) {
                arrCur = 11;
            }
            $('.calendarWrap').hide().eq(arrCur).show();
            $('.selectBox h2').text(year + '年' + (arrCur + 1) + '月');
        });

        $('.selectBox').on('mouseenter', function () {
            $(this).find('.peekPopup').show();
        });

        $('.selectBox').on('mouseleave', function () {
            $(this).find('.peekPopup').hide();
        });

        $('.selectBox li').on('click', function () {
            arrCur = $(this).index();
            $('.calendarWrap').hide().eq(arrCur).show();
            $('.selectBox h2').text(year + '年' + (arrCur + 1) + '月');
            $('.peekPopup').hide().find('li').removeClass('cur').eq(arrCur).addClass('cur');
        });

        $('.backBtn').on('click', function () {
            arrCur = current_month;
            $('.calendarWrap').hide().eq(current_month).show();
            $('.selectBox h2').text(year + '年' + (current_month + 1) + '月');
            $('.peekPopup li').removeClass('cur').eq(current_month).addClass('cur');
        });

        $('.leftBox li').on('click', function () {
            if ($(this).attr('class') == 'cur') {
                $(this).removeClass('cur');
                $('.calendarBody span').removeClass('em');
                return;
            }
            $(this).addClass('cur').siblings().removeClass('cur');
            var name = $(this).text();

            $('.calendarBody span').removeClass('em');
            $('.calendarBody span').each(function () {
                if (name == $(this).text()) {
                    $(this).addClass('em');
                }
            });
        });
    }

    function create_calendar(data) {
        var calendarTemp = ['<div class="calendarWrap"><ul class="calendarBody">'];
        var i, len, next_year = parseInt(year) + 1,
            time_start = new Date(year + '-01-01'),
            time_end = new Date(next_year + '-01-01'),
            current_date = time_start,
            current_month = time_start.getMonth();

        while (current_date.getTime() < time_end.getTime()) {
            if (current_date.getMonth() != current_month) {
                // white space after last date
                len = (8 - current_date.getDay()) % 7;
                for (i = 0; i < len; i++) {
                    calendarTemp.push('<li>&nbsp;</li>');
                }

                calendarTemp.push('</ul></div><div class="calendarWrap"><ul class="calendarBody">');
                current_month = current_date.getMonth();
            } else {
                if (1 == current_date.getDay()) {
                    calendarTemp.push('<ul class="calendarBody">');
                }
            }

            if (current_date.getDate() == 1) {
                // white space before first date
                len = (current_date.getDay() + 6) % 7;
                for (i = 0; i < len; i++) {
                    calendarTemp.push('<li>&nbsp;</li>');
                }
            }

            if (myDate.getDate() == current_date.getDate() && myDate.getMonth() == current_date.getMonth()) {
                calendarTemp.push('<li class="cur"><p class="d">' + current_date.getDate() + '</p>' + getData(current_date) + getNote(current_date) + '</li>');
            } else {
                calendarTemp.push('<li><p class="d">' + current_date.getDate() + '</p>' + getData(current_date) + getNote(current_date) + '</li>');
            }

            if (current_date.getDay() == 0) {
                calendarTemp.push('</ul>');
            }
            current_date.setTime(current_date.getTime() + 86400000);
        }
        $('#calendarBox').append(calendarTemp.join(''));
    }

    function getData(cur_time) {
        var temp = '';
        var len = calendarData.length;
        var time = cur_time.getFullYear() + '-' + (cur_time.getMonth() + 1) + '-' + cur_time.getDate();
        for (var i = 0; i < len; i++) {
            if (time == calendarData[i].startTime) {
                temp += '<p class="n">' + calendarData[i].content + '</p><p class="u"><span>' + calendarData[i].users.join('</span>,<span>') + '</span></p>';
            }
        }
        return temp;
    }

    function getNote(cur_time) {
        var temp = '';
        var len = noteData.length;
        var month = cur_time.getMonth() + 1;
        if(month < 10) {
            month = 0 + '' + month;
        }
        var dates = cur_time.getDate();
        if(dates < 10) {
            dates = 0 + '' + dates;
        }
        var time = cur_time.getFullYear() + '-' + month + '-' + dates;
        for (var i = 0; i < len; i++) {
            if(time == noteData[i].startTime) {
                temp += '<p class="g"><span>' + noteData[i].startName + '</span>代<span>' + noteData[i].endName + '</span></p>';
            }
        }
        return temp;
    }

    function statistical() {
        var user = new Object();
        $('.leftBox li').each(function() {
            var name = $(this).text();
            user[name] = {
                'jier': 0,
                'zhoumo': 0
            };
        });
        $('.calendarBody li').each(function() {
            var $el = $(this);
            if($el.find('.n').text() == '周六值班' || $el.find('.n').text() == '周日值班') {
                $el.find('.u span').each(function() {
                    var n = $(this).text();
                    user[n].zhoumo = user[n].zhoumo + 1;
                });
            }
            if($el.find('.n').text() && $el.find('.n').text() != '周六值班' && $el.find('.n').text() != '周日值班' && $el.find('.u').text() != '') {
                $el.find('.u span').each(function() {
                    var n = $(this).text();
                    user[n].jier = user[n].jier + 1;
                });
            }
        });

        $('.leftBox li').each(function() {
            var name = $(this).text();
            $(this).append('(' + user[name].zhoumo + ')(' + user[name].jier + ')');
        });
    }
})(jQuery);