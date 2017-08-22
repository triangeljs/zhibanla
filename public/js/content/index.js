document.onselectstart = new Function('event.returnValue = false;');
var ciic_zhiban = {};

(function ($) {
    //动画控制
    var im = new Image();
    im.src = $('#login img').attr('src');
    $(im).on('load', function() {
        $('#login').delay(2500).fadeOut(300);
    });

    //视图控制
    var currentTime = new Date();
    $('#currentTime').html(currentTime.getFullYear() + '年' + (currentTime.getMonth() + 1) + '月');

    $('#viewSwitch span').on('click', function () {
        var name = $(this).text();
        $(this).addClass('cur').siblings().removeClass('cur');
        if (name == '年') {
            $('.yearBox').css({ 'display': 'flex' });
            //$('.monthBox, #monthBtn').hide();
            $('.monthBox').hide();
            $('#monthBtn').addClass('rm');
        }
        if (name == '月') {
            $('.yearBox').hide();
            //$('.monthBox, #monthBtn').show();
            $('.monthBox').show();
            $('#monthBtn').removeClass('rm');
        }
    });
})(jQuery);

(function ($) {
    //月视图渲染
    var myDate = new Date(),
        month = myDate.getMonth(),
        day = myDate.getDate(),
        curMonthTime = new Date(myDate.getFullYear(), month, day, 8).getTime();

    $('.monthUnit').hide().eq(month).show();
    $('.createMonth').each(function () {
        var months = $(this).data('month');
        var temp = getMonth(months);
        $(this).parent().html(temp);
    });

    $('#' + curMonthTime).addClass('cur');

    $('#monthBtn .arrLeft').on('click', function () {
        var isclass = $('#viewSwitch span:last').hasClass('cur');
        if(isclass) {
            return false;
        }
        if (month - 1 < 0) {
            month = 0;
        } else {
            month = month - 1;
        }
        showMonth(month)
    });
    $('#monthBtn .arrRight').on('click', function () {
        var isclass = $('#viewSwitch span:last').hasClass('cur');
        if(isclass) {
            return false;
        }
        if (month + 1 > 11) {
            month = 11;
        } else {
            month = month + 1;
        }
        showMonth(month)
    });
    $('#monthBtn .arrCenter').on('click', function () {
        var isclass = $('#viewSwitch span:last').hasClass('cur');
        if(isclass) {
            return false;
        }
        month = myDate.getMonth();
        showMonth(month);
    });

    function showMonth(month) {
        var currentTime = new Date();
        $('#currentTime').html(currentTime.getFullYear() + '年' + (month + 1) + '月');
        $('.monthUnit').hide().eq(month).show();
    }
})(jQuery);

(function ($) {
    //年视图渲染
    var myDate = new Date(),
        month = myDate.getMonth(),
        day = myDate.getDate(),
        curMonthTime = new Date(myDate.getFullYear(), month, day, 8).getTime();
    
    $('.createNode').each(function () {
        var month = $(this).data('month');
        var temp = getYear(month);
        $(this).parent('.yItem').html(temp);
    });

    $('.d-' + curMonthTime).addClass('dayCur');

    $('.sideBar li span').on('click', function () {
        var isclass = $(this).hasClass('cur');
        var name = $(this).text();
        var className = ciic_zhiban[name].join(',');
        $('.yList span').removeClass('yCur');
        if(isclass) {
            $(this).removeClass('cur');
        } else {
            $(this).addClass('cur').parent().siblings().find('span').removeClass('cur');
            $(className).addClass('yCur');
        }
    });

    $('.sideBar h2').on('click', function () {
        $('.yList span').removeClass('yCur');
    });
})(jQuery);

(function ($) {
    //数据载入
    $.getJSON('paiban', function (data) {
        data.rota.forEach(function (item) {
            var id = item.time,
                $el = $('#' + id);
            $el.find('.title').append('<h2>' + item.title + '</h2>');
            if (item.name != '') {
                $el.append('<ul class="users"><li data-batch="' + item.batch + '">' + item.name + '</li></ul>');
                $('.d-' + id).addClass('cur');
                if(ciic_zhiban[item.name]) {
                    ciic_zhiban[item.name].push('.d-' + id);
                } else {
                    ciic_zhiban[item.name] = ['.d-' + id];
                }
                
            }
        });
        data.special.forEach(function (item) {
            var id = item.specialTime,
                $el = $('#' + id),
                isTitle = $el.find('.title h2').length,
                isUsers = $el.find('.users').length,
                usersArr = [];
            if (isTitle > 0) {
                $el.find('.title h2').text(item.specialTitle);
            } else {
                $el.find('.title').append('<h2>' + item.specialTitle + '</h2>');
            }
            item.specialUsers.forEach(function (name) {
                usersArr.push('<li>' + name + '</li>');
                ciic_zhiban[name].push('.d-' + id)
            });
            if (isUsers > 0) {
                $el.find('.users').append(usersArr.join(''));
            } else {
                $el.append('<ul class="users">' + usersArr.join('') + '</ul>');
            }
            $('.d-' + id).addClass('cur');
        });
        data.note.forEach(function (item) {
            $('.users li').each(function () {
                var batch = $(this).data('batch'),
                    name = $(this).text();
                if (item.startName == name && item.batch == batch) {
                    $(this).html(item.endName + ' > <span>' + item.startName + '</span>');
                }
            });
        });
    });
})(jQuery);

function getYear(month) {
    var len,
        myDate = new Date(),
        year = myDate.getFullYear(),
        nextMonth = month + 1,
        time_start = new Date(year, month, 1, 8),
        time_end = new Date(year, nextMonth, 1, 8),
        current_date = time_start,
        monthArr = ['一', "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
        calendarTemp = ['<h2 class="yTitle">' + monthArr[month] + '月</h2>', '<div class="yList"><div><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div>'];

    while (time_start.getTime() < time_end.getTime()) {
        if (current_date.getDate() == 1 && current_date.getDay() != 1) {
            calendarTemp.push('<div>');
            len = (current_date.getDay() + 6) % 7;
            calendarTemp.push((new Array(len)).fill('<span>&nbsp;</span>').join(''));
        }
        if (current_date.getDay() == 1) {
            calendarTemp.push('<div>');
        }
        calendarTemp.push('<span class="d-' + current_date.getTime() + '">' + current_date.getDate() + '</span>');
        if (current_date.getDay() != 0 && current_date.getDate() == getDaysInMonth(year, month)) {
            len = (7 - current_date.getDay());
            calendarTemp.push((new Array(len)).fill('<span>&nbsp;</span>').join(''));
            calendarTemp.push('</div>');
        }
        if (current_date.getDay() == 0) {
            calendarTemp.push('</div>');
        }
        current_date.setTime(current_date.getTime() + 86400000);
    }
    calendarTemp.push('</div></div>');
    return calendarTemp.join('');
}

function getMonth(month) {
    var len,
        myDate = new Date(),
        year = myDate.getFullYear(),
        nextMonth = month + 1,
        time_start = new Date(year, month, 1, 8),
        time_end = new Date(year, nextMonth, 1, 8),
        current_date = time_start,
        calendarTemp = ['<div class="monthNav"><span>星期一</span><span>星期二</span><span>星期三</span><span>星期四</span><span>星期五</span><span>星期六</span><span>星期日</span></div>'];

    while (time_start.getTime() < time_end.getTime()) {
        if (current_date.getDate() == 1 && current_date.getDay() != 1) {
            calendarTemp.push('<div class="monthList">');
            len = (current_date.getDay() + 6) % 7;
            calendarTemp.push((new Array(len)).fill('<div class="monthInfo">&nbsp;</div>').join(''));
        }
        if (current_date.getDay() == 1) {
            calendarTemp.push('<div class="monthList">');
        }

        //calendarTemp.push('<div id="' + current_date.getTime() + '" class="monthInfo"><div class="title"><span>' + current_date.getDate() + '</span></div></div>');
        if(current_date.getDate() == 1) {
            calendarTemp.push('<div id="' + current_date.getTime() + '" class="monthInfo"><div class="title"><span>' + (current_date.getMonth() + 1) + '月' + current_date.getDate() + '日</span></div></div>');
        } else {
            calendarTemp.push('<div id="' + current_date.getTime() + '" class="monthInfo"><div class="title"><span>' + current_date.getDate() + '</span></div></div>');
        }

        if (current_date.getDay() != 0 && current_date.getDate() == getDaysInMonth(year, month)) {
            len = (7 - current_date.getDay());
            calendarTemp.push((new Array(len)).fill('<div class="monthInfo">&nbsp;</div>').join(''));
            calendarTemp.push('</div>');
        }
        if (current_date.getDay() == 0) {
            calendarTemp.push('</div>');
        }
        current_date.setTime(current_date.getTime() + 86400000);
    }
    return calendarTemp.join('');
}

function getDaysInMonth(year, month) {
    month = parseInt(month) + 1;
    var temp = new Date(year, month, 0);
    return temp.getDate();
}