function mydownload(data,name,type) {
    var byteCharacters = atob(data);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: type});
    var filename =  name;
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
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

    var win = window.open("#","_blank");
    var title = "my tab title";
    win.document.write('<html><title>'+ title +'</title><body style="margin-top: 0px; margin-left: 0px; margin-right: 0px; margin-bottom: 0px;">');
    win.document.write(objbuilder);
    win.document.write('</body></html>');
    jQuery(win.document);
}

function prepareFactorToPrint(item,$rootScope) {
    var param = '<div class="myprint" style="page-break-after:always;">' +
        '<h6 style="margin-bottom: 10px !important;' +
        'text-align: center;">'+item.restaurant.name+'</h6>' +
        '<h6 style="margin-bottom: 10px !important;' +
        'text-align: center;">'+item.restaurant.address.address+'</h6>' +
        '<h6 style="margin-bottom: 10px !important;' +
        'text-align: center;">'+item.restaurant.address.phone+'</h6>' +
        '<div style="list-style: none;">' +
        '<div>' +
        '<div style="animation-delay: 1.5s;height: 20px;border-bottom:1px solid black;border-bottom-width:thin' +
        'border-bottom: 2px dashed black !important;font-size: small;border-top: 0;list-style-type: none;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 25%;text-align: left;"> قیمت </span>' +
        '<span style="color: black;font-weight: 300;width: 25%;text-align: center"> تخفیف </span>' +
        '<span style="color: black;font-weight: 300;width: 50%;text-align: right;float: right;"> نام غذا </span>' +
        '</div>' +
        '</div>';
    for (var i = 0; i < item.foodOrders.length; i++) {
        param += '<div>' +
            '<div style="animation-delay: 1.5s;overflow: auto;' +
            'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;list-style-type: none;">' +
            '<span style="float: left;letter-spacing: 1px;color: black;width: 25%;text-align: left;">' + $rootScope.formatPrice(item.foodOrders[i].foodPriceAfterOff) + '</span>' +
            '<span style="letter-spacing: 1px;color: black;width: 25%;text-align: center;">' + $rootScope.formatPrice(item.foodOrders[i].foodOriginalPrice - item.foodOrders[i].foodPriceAfterOff) + '</span>' +
            '<span style="color: black;font-weight: 300;width: 50%;text-align: right;float: right;">' + item.foodOrders[i].food.name + '</span>' +
            '</div>' +
            '</div>'
    }
    param += '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;list-style-type: none;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;">'+$rootScope.formatPrice(item.totalContainerPrice)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;">ظرف</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;list-style-type: none;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;">'+(item.totalTaxAmount + item.deliveryPriceTax)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;">مالیات</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;list-style-type: none;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;">'+$rootScope.formatPrice(item.deliveryPrice)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;">هزینه حمل</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div ' +
        'style="animation-delay: 1.5s;overflow: auto;list-style-type: none;font-size: x-small;border-top: 0;margin-bottom: 0;border-top: 1px solid black !important;border-bottom: none !important;">' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;">مجموع</span><span ' +
        'style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;">'+item.totalAmount+'</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">'+item.employee.company.name+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">مشتری</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">'+item.employee.name+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">تحویل گیرنده</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">'+item.employee.address.address+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">آدرس</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">'+item.employee.address.phone+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">شماره</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">'+$rootScope.myFormatDate(item.deliveryDate)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">زمان تحویل</span>' +
        '</div>' +
        '</div>';
        if (item.description) {
            param += '<div>' +
            '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
            'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;">' +
            '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;">' + item.description + '</span>' +
            '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;">توضیحات</span>' +
            '</div>' +
            '</div>';
        }
        param += '</div>' +
            '<style>@page  {size: 8cm 100%}</style>';
    return param;
}

function printFactor(param) {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');
    mywindow.document.write('<html><head><title></title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1></h1>');
    mywindow.document.write(param);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();
}