(function ($) {
    var myChart = echarts.init(document.getElementById('main')),
        usersArr = $('#usersData').text().split(','),
        zhoumoArr = $('#zhoumoData').text().split(','),
        jieriArr = $('#jieriData').text().split(','),
        shijianArr = $('#shijianData').text().split(',');
    var option = {
        legend: {
            data: ['周末值班', '节日值班', '事件值班'],
            align: 'right',
            right: 10
        },
        tooltip: {
            
        },
        xAxis: {
            type: 'category',
            data: usersArr
        },
        yAxis: {
            interval: 1
        },
        series: [{
            name: '周末值班',
            type: 'bar',
            stack: '综合',
            itemStyle: {
                normal: { color: 'rgba(77,199,201,1)', label: { show: true } }
            },
            data: zhoumoArr.map(replaceItem)
        }, {
            name: '节日值班',
            type: 'bar',
            stack: '综合',
            itemStyle: {
                normal: { color: 'rgba(244,188,142,1)', label: { show: true } }
            },
            data: jieriArr.map(replaceItem)
        }, {
            name: '事件值班',
            type: 'bar',
            stack: '综合',
            itemStyle: {
                normal: { color: 'rgba(112,182,231,1)', label: { show: true } }
            },
            data: shijianArr.map(replaceItem)
        }]
    };

    myChart.setOption(option);

    $(window).on('resize', function() {
        myChart.resize();
    });

    function replaceItem(num) {
        return num == 0 ? '' : num;
    }
})(jQuery);