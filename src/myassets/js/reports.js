function mydownload(data, name, type) {
    var byteCharacters = atob(data);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: type});
    var filename = name;
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);

        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });

        elem.dispatchEvent(clickEvent);
    }
}


function myview(data) {
    var objbuilder = '';
    objbuilder += ('<object width="100%" height="100%" data="data:application/pdf;base64,');
    objbuilder += (data);
    objbuilder += ('" type="application/pdf" class="internal">');
    objbuilder += ('<embed src="data:application/pdf;base64,');
    objbuilder += (data);
    objbuilder += ('" type="application/pdf"  />');
    objbuilder += ('</object>');

    var win = window.open("#", "_blank");
    var title = "my tab title";
    win.document.write('<html><title>' + title + '</title><body style="margin: 0px !important;padding: 0 !important;">');
    win.document.write(objbuilder);
    win.document.write('</body></html>');
    jQuery(win.document);
}

function prepareFactorToPrint(item, $rootScope) {
    if (!item.employee.department) {
        item.employee.department = {
            name: ""
        }
    }
    var param = '<div class="myprint" style="page-break-after:always;">' +
        '<div style="width: 100%;height: 70px;border-bottom: 2px;border-bottom-style: solid;"> ' +
        '<div style="text-align: right;font-size: medium;width: 48%;float: left;line-height: 45px;">' + moment.utc(item.deliveryDate).subtract("minutes", 15).format("HH:mm") + '</div>' +
        '<div style="text-align: left;font-size: medium;width: 48%;float: right"><img style="width: 45px" src="/assets/img/ui/clock.png"></div>' +
        '</div>' +
        '<div style="width: 100%;height: 150px;border-bottom: 2px;border-bottom-style: solid;padding-top: 30px"> ' +
        '<div style="text-align: center;font-size: medium;width: 50%;float: left;line-height: 45px">' +
        '<div style="border-bottom: 1px;border-bottom-style: solid;"> ' + item.location.title + '</div>' +
        '<div>' + item.employee.department.name + '</div>' +
        '</div>' +
        '<div style="text-align: center;font-size: medium;width: 50%;float: right;padding-top: 35px">' + item.employee.company.name + '</div>' +
        '</div>' +
        '<div style="width: 100%;height: 50px;border-bottom: 2px;border-bottom-style: solid;padding-top: 15px;font-size: small;text-align: right;direction: rtl"> ' +
        item.location.address +
        '</div>' +
        '<div style="text-align: center;font-size: medium;width: 100%;float: right;padding-top: 10px;margin-top: 30px">' + item.restaurant.name + '</div>' +
        '<div style="list-style: none;">' +
        '<div>' +
        '<div style="animation-delay: 1.5s;height: 20px;' +
        ';font-size: small;border-top: 0;list-style-type: none;">' +
        '<div style="float:left;color: black;font-weight: 300;width: 10%;text-align: center;font-size: medium"> تعداد </div>' +
        '<span style="color: black;font-weight: 300;width: 90%;text-align: right;float: right;font-size: medium;direction: rtl"> نام غذا </span>' +
        '</div>' +
        '</div>';
    for (var i = 0; i < item.foodOrders.length; i++) {
        param += '<div>' +
            '<div style="animation-delay: 1.5s;overflow: auto;' +
            'border-top: 1px dashed black !important;font-size: x-small;border-bottom: 0;list-style-type: none;line-height: 30px;width: 100%">' +
            '<div style="color: black;font-weight: 300;width: 10%;text-align: center;float: left;font-size: medium">' + item.foodOrders[i].count + '</div>' +
            '<div style="color: black;font-weight: 300;width: 90%;text-align: right;float: right;font-size: medium">' + item.foodOrders[i].food.name + '</div>' +
            '</div>' +
            '</div>'
    }
    param +=
        '<div style="margin-top: 30px;border-top: 2px;border-top-style: solid;padding-top: 20px">' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: large">' + item.employee.name + '</div>' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: large">' + item.employee.mobile + '</div>' +
        '</div>' +
        '</div>' +

        '<div style="margin-top: 20px;border-top: 2px;border-top-style: solid;padding-top: 20px">' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: medium">' + $rootScope.subtranctMinutes(item.deliveryDate, 15) + '</div>' +
        '</div>' +
        '</div>' +

        '<div style="margin-top: 20px;border-top: 2px;border-top-style: solid;padding-top: 20px">' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: large">شماره فاکتور</div>' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: large">' + item.id + '</div>' +
        '</div>' +
        '</div>';
    if (item.description) {
        param += '<div style="margin-top: 20px;border-top: 2px;border-top-style: solid;padding-top: 20px">' +
            '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
            'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
            '<span style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: medium">توضیحات مشتری</span>' +
            '<span style="float: left;letter-spacing: 1px;color: black;width: 100%;text-align: center;font-size: medium">' + item.description + '</span>' +
            '</div>' +
            '</div>';
    }
    param += '<div style="text-align: center;font-size: medium;direction: rtl;margin-top: 30px;border-top: 2px;border-top-style: solid;padding-top: 30px">' +
        '<img style="width: 60px;height: 30px" src="/assets/img/ui/mobile/karafeed.png"/>' +
        '</div>' +
        '<div style="text-align: center;font-size: small;direction: rtl;margin-top: 10px">شبکه تخصصی تامین غذای شرکتی</div>' +
        '<div style="text-align: center;font-size: medium;direction: rtl;margin-top: 10px">021-26712337</div>' +
        '<div style="text-align: center;font-size: medium;direction: rtl;margin-top: 10px">www.karafeed.com</div>' +
        '</div>';
    return param;
}

function printFactor(param) {
    var mywindow = window.open('', 'PRINT', 'height=auto,width=8cm');
    mywindow.document.write('<html><head><title></title>');
    mywindow.document.write('</head><body style="padding: 0 !important;margin: 0 !important;">');
    mywindow.document.write(param);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();
}
