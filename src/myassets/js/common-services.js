function startLoading() {
    $('#cube-preload').css("display", "block");
}

function stopLoading() {
    $('#cube-preload').css("display", "none");
}
var notificationOpts = {
    autoDismiss: false,
    positionClass: 'toast-top-right',
    type: 'info',
    timeOut: '5000',
    extendedTimeOut: '2000',
    allowHtml: false,
    closeButton: true,
    tapToDismiss: true,
    progressBar: true,
    newestOnTop: true,
    maxOpened: 0,
    preventDuplicates: false,
    preventOpenDuplicates: false,
    title: "Some title here",
    msg: "Type your message here"
};
function showMessage(toastrConfig, toastr, title, msg, type) {
    angular.extend(toastrConfig, notificationOpts);
    toastr[type](msg, title)
}
function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
}
