(function ($) {
    $("#paibanDate").attr({ 'data-lang': "zh", 'data-theme': "my-style", 'data-large-mode': "true", 'data-format': "Y-m-d", 'data-init-set': "false", 'data-max-year': '2100' }).dateDropper();
})(jQuery);

function validate_form() {
    var txt = $('#paibanDate').val();
    if(txt == '') {
        return false;
    }
    return true;
}