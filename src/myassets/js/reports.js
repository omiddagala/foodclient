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
        //document.getElementById("test").appendChild(elem);
        //elem.className = 'ttest';
        document.body.appendChild(elem);
        window.location = elem.href;
        //elem.click();
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
    win.document.write('<html><title>'+ title +'</title><body style="margin: 0px !important;padding: 0 !important;">');
    win.document.write(objbuilder);
    win.document.write('</body></html>');
    jQuery(win.document);
}

function prepareFactorToPrint(item,$rootScope) {
    var param = '<div class="myprint" style="page-break-after:always;">' +
        '<h5 style="text-align: center;font-size: medium;direction: rtl">'+item.restaurant.name+'</h5>' +
        '<h5 style="text-align: center;font-size: medium;direction: rtl">'+item.restaurant.address.address+'</h5>' +
        '<h5 style="text-align: center;font-size: medium;direction: rtl">'+item.restaurant.address.phone+'</h5>' +
        '<div style="list-style: none;">' +
        '<div>' +
        '<div style="animation-delay: 1.5s;height: 20px;border-bottom:1px solid black;border-bottom-width:thin' +
        'border-bottom: 2px dashed black !important;font-size: small;border-top: 0;list-style-type: none;">' +
        '<div style="float: left;letter-spacing: 1px;color: black;width: 30%;text-align: left;font-size: medium"> قیمت </div>' +
        '<div style="float:left;color: black;font-weight: 300;width: 25%;text-align: center;font-size: medium"> تخفیف </div>' +
        '<div style="float:left;color: black;font-weight: 300;width: 5%;text-align: center;font-size: medium"> تعداد </div>' +
        '<span style="color: black;font-weight: 300;width: 40%;text-align: right;float: right;font-size: medium;direction: rtl"> نام غذا </span>' +
        '</div>' +
        '</div>';
    for (var i = 0; i < item.foodOrders.length; i++) {
        param += '<div>' +
            '<div style="animation-delay: 1.5s;overflow: auto;' +
            'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;list-style-type: none;line-height: 30px">' +
            '<div style="float: left;letter-spacing: 1px;color: black;width: 30%;text-align: left;font-size: medium">' + $rootScope.formatPrice(item.foodOrders[i].foodPriceAfterOff) + '</div>' +
            '<div style="float:left;letter-spacing: 1px;color: black;width: 25%;text-align: center;font-size: medium">' + $rootScope.formatPrice(item.foodOrders[i].foodOriginalPrice - item.foodOrders[i].foodPriceAfterOff) + '</div>' +
            '<div style="color: black;font-weight: 300;width: 5%;text-align: center;float: left;font-size: medium">' + item.foodOrders[i].count + '</div>' +
            '<div style="color: black;font-weight: 300;width: 40%;text-align: right;float: right;font-size: medium">' + item.foodOrders[i].food.name + '</div>' +
            '</div>' +
            '</div>'
    }
    param += '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;list-style-type: none;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;font-size: medium">'+$rootScope.formatPrice(item.totalContainerPrice)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;font-size: medium">ظرف</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;list-style-type: none;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;font-size: medium">'+(item.totalTaxAmount + item.deliveryPriceTax)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;font-size: medium">مالیات</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="overflow: auto;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;list-style-type: none;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;font-size: medium">'+$rootScope.formatPrice(item.deliveryPrice)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;font-size: medium">هزینه حمل</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div ' +
        'style="animation-delay: 1.5s;overflow: auto;list-style-type: none;font-size: x-small;border-top: 0;margin-bottom: 0;border-top: 1px solid black !important;border-bottom: none !important;line-height: 30px">' +
        '<span style="color: black;font-weight: 300;width: 60%;text-align: right;float: right;font-size: medium">مجموع</span><span ' +
        'style="float: left;letter-spacing: 1px;color: black;width: 40%;text-align: left;font-size: medium">'+item.totalAmount+'</span>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">'+item.employee.company.name+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">مشتری</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">'+item.employee.name+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">تحویل گیرنده</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">'+item.employee.address.address+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">آدرس</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">'+item.employee.address.phone+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">شماره</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">'+$rootScope.myFormatDate(item.deliveryDate)+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">زمان تحویل</span>' +
        '</div>' +
        '</div>' +
        '<div>' +
        '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
        'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
        '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">kf-'+item.id+'</span>' +
        '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">شماره فاکتور</span>' +
        '</div>' +
        '</div>';
        if (item.description) {
            param += '<div>' +
            '<div style="animation-delay: 1.5s;overflow: auto;list-style-type: none;' +
            'border-bottom: 1px dashed black !important;font-size: x-small;border-top: 0;;margin-bottom: 0;border-bottom: none !important;line-height: 30px">' +
            '<span style="float: left;letter-spacing: 1px;color: black;width: 80%;text-align: left;font-size: medium">' + item.description + '</span>' +
            '<span style="color: black;font-weight: 300;width: 20%;text-align: right;float: right;font-size: medium">توضیحات</span>' +
            '</div>' +
            '</div>';
        }
        param += '<div style="text-align: center;font-size: medium;direction: rtl;margin-top: 30px">کارافید</div>' +
            '<div style="text-align: center;font-size: medium;direction: rtl;margin-top: 10px">02126712337</div>' +
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