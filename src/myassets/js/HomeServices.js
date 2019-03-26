var articleListMain;
var articleListPaginationMain;
var articleList;
var articleListPagination;
var activeTab = 0;

function startLoading() {
    $('#cube-preload').css("display", "block");
}

function stopLoading() {
    $('#cube-preload').css("display", "none");
}

function getPageIdMain(n) {
    return 'article-page-main' + n;
}

var products = [];

function getArticleMain($scope, $compile, $parse, data) {
    var allOfThem = document.createElement('div');

    var row = document.createElement('div');
    row.className = 'row';
    allOfThem.appendChild(row);

    for (var i = 0; i < data.length; i++) {
        var col = document.createElement('div');
        col.className = "col-lg-3 col-md-3 col-sm-4 col-xs-6 col-xxs-12 food-box padding-lg";//vahid seraj updated code (1397.09.29)
        row.appendChild(col);

        var cardContainer = document.createElement('div');
        cardContainer.className = "scene scene--card";
        col.appendChild(cardContainer);

        var card = document.createElement('div');
        card.className = "newcard";
        cardContainer.appendChild(card);

        var info = document.createElement('img');
        info.src = "assets/img/ui/info.png";
        info.className = "card__info";
        card.appendChild(info);
        info.addEventListener('click', function (e) {
            flipCard(e);
        });

        var close = document.createElement('div');
        close.className = "card__close";
        card.appendChild(close);
        close.addEventListener('click', function (e) {
            flipCard(e);
        });

        var detail = document.createElement('div');
        detail.className = "card__detail font-xs";
        detail.innerHTML = "جزییات";
        card.appendChild(detail);
        detail.setAttribute("name", data[i].name);
        detail.setAttribute("price", data[i].price.foodPrice);
        detail.setAttribute("calorie", data[i].mealAverageCalorie);
        detail.setAttribute("foodid", data[i].id);
        detail.setAttribute("resname", data[i].restaurant.name);
        detail.setAttribute("resid", data[i].restaurant.id);
        detail.setAttribute("foodtype", data[i].foodType);
        detail.setAttribute("imageaddress", data[i].imageAddress);
        detail.addEventListener('click', function (e) {
            $scope.detailFoodId = e.currentTarget.getAttribute("foodid");
            $scope.foodNameForDetail = e.currentTarget.getAttribute("name");
            $scope.foodPrice = e.currentTarget.getAttribute("price");
            $scope.foodCalories = e.currentTarget.getAttribute("calorie");
            $scope.priceOffTitle = e.currentTarget.getAttribute("priceofftitle");
            $scope.priceOff = e.currentTarget.getAttribute("priceoff");
            $scope.orderDate = e.currentTarget.getAttribute("orderdate");
            $scope.orderTime = e.currentTarget.getAttribute("ordertime");
            $scope.detailResName = e.currentTarget.getAttribute("resname");
            $scope.detailResId = e.currentTarget.getAttribute("resid");
            $scope.detailFoodType = e.currentTarget.getAttribute("foodtype");
            $scope.imageAddressForDetail = e.currentTarget.getAttribute("imageaddress");
            $scope.foodDetail($scope.detailFoodId);
            $scope.open('app/pages/employee/home/detail.html', 'md');
            $scope.cleanComments();
            $scope.fetchComments();
            $scope.loadYourLastRateToThisFood($scope.detailFoodId);
        });

        var rate = document.createElement('div');
        rate.className = "card__rate";
        rate.innerHTML = data[i].averageRate === 0 ? "-" : data[i].averageRate;
        card.appendChild(rate);

        var bottom = document.createElement('div');
        bottom.className = "card__bottom";
        bottom.style.cursor = "pointer";
        card.appendChild(bottom);

        var date = document.createElement('div');
        date.className = "card__bottom_date";


        date.innerHTML = "سفارش برای " + m;
        bottom.appendChild(date);
        detail.setAttribute("orderdate", m);
        detail.setAttribute("ordertime", $("#searchTime").val().replace(/\s/g, ''));

        var basket = document.createElement('div');
        basket.className = "card__bottom_basket";
        bottom.appendChild(basket);

        var front = document.createElement('div');
        front.className = "card__face card__face--front";
        card.appendChild(front);

        var card_image_div = document.createElement('div');
        card_image_div.className = "card__image__div";
        front.appendChild(card_image_div);

        var image = document.createElement('img');
        image.src = data[i].imageAddress;
        image.className = "card__image";
        card_image_div.appendChild(image);

        var foodName = document.createElement('div');
        foodName.className = "card__food__name margin__bottom_10 hide__text_overflow";
        foodName.innerHTML = data[i].name;
        front.appendChild(foodName);

        var restaurant_div = document.createElement('div');
        restaurant_div.className = "margin__bottom_10";
        front.appendChild(restaurant_div);

        var restName = document.createElement('div');
        restName.className = "card__restaurant__name hide__text_overflow";
        restName.innerHTML = data[i].restaurant.name;
        restName.style.cursor = "pointer";
        restName.setAttribute("resname", data[i].restaurant.name);
        restName.addEventListener('click', function (e) {
            $scope.goToRestaurantPage(e.currentTarget.getAttribute("resname"));
        });
        restaurant_div.appendChild(restName);

        var restStar = document.createElement('div');
        restStar.className = "card__restaurant__star";
        restaurant_div.appendChild(restStar);

        var restRate = document.createElement('div');
        restRate.className = "card__restaurant__rate";
        restRate.innerHTML = data[i].restaurant.averageRate === 0 ? "-" : data[i].restaurant.averageRate;
        restaurant_div.appendChild(restRate);

        var price_div = document.createElement('div');
        price_div.className = "margin__bottom_10";
        front.appendChild(price_div);

        var priceTitle = document.createElement('div');
        priceTitle.className = "card__price__title";
        priceTitle.innerHTML = "قیمت";
        price_div.appendChild(priceTitle);

        var priceAmount = document.createElement('div');
        priceAmount.className = "card__price__amount";
        priceAmount.innerHTML = $scope.formatPrice(data[i].price.foodPrice);
        price_div.appendChild(priceAmount);

        moment.locale('fa');
        if (data[i].price.preOrderPrice < data[i].price.foodPrice) {
            var today = moment(new Date());
            var t = $("#searchTime").val().split(' ').join('');
            var otherDay = moment.utc($('#taghvim').find('input').val() + " " + t, 'jYYYY/jM/jD HH:mm');
            var diffDays = otherDay.diff(today, 'days');

            priceAmount.className = "card__price__amount is__off";

            var gift_div = document.createElement('div');
            front.appendChild(gift_div);

            var giftTitle = document.createElement('div');
            giftTitle.className = "card__price__title";
            // giftTitle.style.width = "40%"; //vahid seraj updated code (1397.09.29)
            // giftTitle.style.fontSize = "x-small"; //vahid seraj updated code (1397.09.29)
            var offTitle = "رزرو اکنون(" + diffDays + "روزه)";
            giftTitle.innerHTML = offTitle;
            gift_div.appendChild(giftTitle);

            var giftPrice = document.createElement('div');
            giftPrice.className = "card__price__amount";
            giftPrice.style.width = "40%";
            giftPrice.style.color = "#1a4049";
            giftPrice.innerHTML = $scope.formatPrice(data[i].price.preOrderPrice);
            gift_div.appendChild(giftPrice);

            detail.setAttribute("priceoff", data[i].price.preOrderPrice);
            detail.setAttribute("priceofftitle", offTitle);
        }

        var back = document.createElement('div');
        back.className = "card__face card__face--back";
        card.appendChild(back);

        var foodNameInBack = document.createElement('div');
        foodNameInBack.className = "card__food__name margin__bottom_10 hide__text_overflow";
        foodNameInBack.style.color = "white";
        foodNameInBack.style.marginTop = "40px";
        foodNameInBack.innerHTML = data[i].name;
        back.appendChild(foodNameInBack);

        var restaurant_div_back = document.createElement('div');
        restaurant_div_back.className = "margin__bottom_10";
        back.appendChild(restaurant_div_back);

        var backInfoIcon = document.createElement('div');
        backInfoIcon.className = "back__info_icon";
        restaurant_div_back.appendChild(backInfoIcon);

        var restNameInBack = document.createElement('div');
        restNameInBack.className = "card__restaurant__name hide__text_overflow";
        restNameInBack.style.color = "white";
        restNameInBack.style.marginRight = "0";
        restNameInBack.innerHTML = data[i].restaurant.name;
        restNameInBack.style.cursor = "pointer";
        restNameInBack.setAttribute("resname", data[i].restaurant.name);
        restNameInBack.addEventListener('click', function (e) {
            $scope.goToRestaurantPage(e.currentTarget.getAttribute("resname"));
        });
        restaurant_div_back.appendChild(restNameInBack);

        // var card_mokhalafat_title = document.createElement('div');
        // card_mokhalafat_title.className = "card__mokhalafat";
        // card_mokhalafat_title.innerHTML = "مخلفات :";
        // back.appendChild(card_mokhalafat_title);
        //
        // var card__mokhalafat_desc = document.createElement('div');
        // card__mokhalafat_desc.className = "card__mokhalafat_desc";
        // card__mokhalafat_desc.style.color = "white";
        // card__mokhalafat_desc.style.fontSize = "small";
        // card__mokhalafat_desc.style.height = "40px";
        // card__mokhalafat_desc.innerHTML = "از سرور باید بیاید";
        // back.appendChild(card__mokhalafat_desc);

        var card_mokhalafat_title2 = document.createElement('div');
        card_mokhalafat_title2.className = "card__mokhalafat";
        card_mokhalafat_title2.innerHTML = "مواد اولیه :";
        back.appendChild(card_mokhalafat_title2);

        var card__mokhalafat_desc2 = document.createElement('div');
        card__mokhalafat_desc2.className = "card__mokhalafat_desc";
        card__mokhalafat_desc2.style.color = "white";
        card__mokhalafat_desc2.style.fontSize = "small";
        card__mokhalafat_desc2.style.height = "40px";
        card__mokhalafat_desc2.innerHTML = data[i].ingredients;
        back.appendChild(card__mokhalafat_desc2);


        bottom.setAttribute("name", data[i].name);
        bottom.setAttribute("foodtype", data[i].foodType);
        bottom.setAttribute("foodid", data[i].id);
        bottom.setAttribute("resid", data[i].restaurant.id);
        bottom.setAttribute("resname", data[i].restaurant.name);
        bottom.setAttribute("calorie", data[i].mealAverageCalorie);

        // var stats = document.createElement('div');
        // stats.className = "stats";
        // front.appendChild(stats);
        // var stats_container = document.createElement('div');
        // stats_container.className = "stats-container";
        // stats_container.setAttribute("name", data[i].name);
        // stats_container.setAttribute("price", data[i].price.foodPrice);
        // stats_container.setAttribute("foodid", data[i].id);
        // stats_container.setAttribute("resid", data[i].restaurant.id);
        // stats.appendChild(stats_container);
        // var product_options = document.createElement('div');
        // product_options.className = "product-options";
        // stats_container.appendChild(product_options);
        // var strong = document.createElement('div');
        // strong.innerHTML = "رستوران";
        // product_options.appendChild(strong);
        // var span = document.createElement('div');
        // span.innerHTML = data[i].restaurant.name;
        // product_options.appendChild(span);
        // var span2 = document.createElement('div');
        // span2.style.color = $('.product').css("background-color");
        // span2.className = "detailText";
        // span2.innerHTML = "جزییات";
        // product_options.appendChild(span2);
        //
        // var back = document.createElement('div');
        // back.className = "product-back";
        // c.appendChild(back);
        // var shadow2 = document.createElement('div');
        // shadow2.className = "shadow";
        // back.appendChild(shadow2);
        // var carousel = document.createElement('div');
        // carousel.className = "carousel";
        // back.appendChild(carousel);
        // var carousel_container = document.createElement('ul');
        // carousel_container.className = "carousel-container";
        // carousel.appendChild(carousel_container);
        // var li = document.createElement('li');
        // carousel_container.appendChild(li);
        // var image2 = document.createElement('div');
        // image2.style.color = "white";
        // image2.style.direction = "rtl";
        // image2.style.fontSize = "large";
        // image2.innerHTML = data[i].ingredients;
        // li.appendChild(image2);
        // var flip_back = document.createElement('div');
        // flip_back.className = "flip-back";
        // back.appendChild(flip_back);
        // var cy = document.createElement('div');
        // cy.className = "cy";
        // flip_back.appendChild(cy);
        // var cx = document.createElement('div');
        // cx.className = "cx";
        // flip_back.appendChild(cx);
        //
        // $(stats_container).click(function (e) {
        //     var foodId = e.currentTarget.getAttribute("foodid");
        //     var resId = e.currentTarget.getAttribute("resid");
        //     $scope.foodDetail(foodId);
        //     $scope.loadYourLastRateToThisFood(foodId);
        //     $scope.cleanComments();
        //     var productCard = $(this).parent().parent().parent().parent();
        //     var floatImage = productCard.find(".card_inner__header");
        //     var position = floatImage.offset();
        //     var productImage = $(productCard).find('img').get(0).src;
        //     $("#omid_content").css({
        //         'top': position.top + 'px',
        //         "left": position.left + 'px',
        //         'z-index': '99999',
        //         'display': 'block'
        //     });
        //     $("#omid_art").css("display", "none");
        //     $("#omid_img").attr("xlink:href", productImage);
        //     $(".page-top").css("opacity", "0.1");
        //     $(".menu-top").css("opacity", "0.1");
        //     $(".al-sidebar").css("opacity", "0.1");
        //     $(".row").css("opacity", "0.1");
        //     $(".art_card__image").click();
        //     setTimeout(function () {
        //         $("#omid_art").css("display", "block");
        //         $('#foodNameForDetail').text(e.currentTarget.getAttribute("name"));
        //         $('#foodPriceForDetail').text(e.currentTarget.getAttribute("price"));
        //         $('#foodCalorieForDetail').text(e.currentTarget.getAttribute("calorie"));
        //         $('#foodIdForDetail').val(foodId);
        //         $('#resIdForDetail').val(resId);
        //     }, 1000);
        //     setTimeout(function () {
        //         $("#floating-button").css("opacity", "1");
        //     }, 2200);
        //     return false;
        // });
        //
        // $(add_to_cart).hover(function (e) {
        //     $(this).css("color", $(this).parent().parent().parent().css("background-color"));
        // });
        //
        // $(view_gallery).hover(function (e) {
        //     $(this).css("color", $(this).parent().parent().parent().css("background-color"));
        // });
        //
        // $(add_to_cart).mouseleave(function (e) {
        //     $(this).css("color", "white");
        // });
        //
        // $(view_gallery).mouseleave(function (e) {
        //     $(this).css("color", "white");
        // });

        $(bottom).click(function (e) {
            var foodid = e.currentTarget.getAttribute("foodid");
            var resid = e.currentTarget.getAttribute("resid");
            var resname = e.currentTarget.getAttribute("resname");
            var foodType = e.currentTarget.getAttribute("foodtype");
            var d = getFormattedDate();
            $scope.addToTodayReserves(e.currentTarget.getAttribute("name"), d, foodid, Number(resid), foodType, resname);
            $scope.orderFood(foodid, d.format('YYYY-MM-DDTHH:mmZ'));
            var productCard = $(this).parent();
            var floatImage = productCard.find(".card__image");
            var position = productCard.offset();

            $("body").append('<div class="floating-cart"></div>');
            var cart = $('div.floating-cart');
            floatImage.clone().appendTo(cart);
            $(cart).css({
                'top': position.top + 'px',
                "left": position.left + 'px'
            }).fadeIn("slow").addClass('moveToCart').css("top", ($(this).offset().top - ($(this).offset().top - $(".newsabad__text").offset().top)) + "px");
            setTimeout(function () {
                $("body").addClass("MakeFloatingCart");
            }, 800);
            setTimeout(function () {
                $('div.floating-cart').remove();
                $("body").removeClass("MakeFloatingCart");
                $scope.createOrderCart(e.currentTarget.getAttribute("name"), d.format('YYYY-MM-DDTHH:mmZ'), foodid, Number(resid), foodType, resname, true);
            }, 1000);
            return false;
        });
        products.push($(card));
    }
    //return allOfThem;
    return $(allOfThem).find('.row .food-box'); //vahid seraj updated code (1397.09.29)
}


function getArticlePageMain(page, $scope, $compile, $parse, day, data) {
    products = [];
    const pageElement = document.createElement('div');
    pageElement.id = getPageIdMain(page);
    pageElement.style.maxWidth = "100%";
    pageElement.className = 'article-list__page_main ui comments';

    var i, j, temparray, chunk = 4;
    // for (i = 0, j = data.length; i < j; i += chunk) {
    //     temparray = data.slice(i, i + chunk);
    //     pageElement.appendChild(getArticleMain($scope, $compile, $parse, temparray));
    // }
    //vahid seraj updated code (1397.09.29) ---------------- [start]
    // debugger;
    var foodCards = getArticleMain($scope, $compile, $parse, data);
    //pageElement.appendChild(foodCards);

    bindEventToProducts(products, day);
    //return pageElement;
    return foodCards;
    //vahid seraj updated code (1397.09.29) ---------------- [end]
}

function addPaginationPageMain(page) {
    var elemId = getPageIdMain(page);
    const pageLink = document.createElement('a');
    pageLink.id = elemId;
    pageLink.innerHTML = page + 1;
    $(pageLink).bind("click", function () {
        $('.mycontent').animate({
            scrollTop: $("#" + elemId).offset().top - 120
        }, 1000);
    });

    const listItem = document.createElement('li');
    listItem.className = 'article-list__pagination__item';
    listItem.appendChild(pageLink);

    articleListPaginationMain.appendChild(listItem);

    if (page === 2) {
        articleListPaginationMain.classList.remove('article-list__pagination--inactive');
    }
}

function fetchPageMain(page, $scope, $compile, $parse, day, data) {
    $(articleListMain).append(getArticlePageMain(page, $scope, $compile, $parse, day, data));
}

function addPageMain(page, $scope, $compile, $parse, day, data) {
    articleListMain = document.getElementById('article-list-main');
    articleListPaginationMain = document.getElementById('article-list-pagination-main');
    fetchPageMain(page, $scope, $compile, $parse, day, data);
    addPaginationPageMain(page);
}




function bindEventToProducts(list, day) {
    $.each(list, function (i, el) {
        // Lift card and show stats on Mouseover
        $(el).find('.make3D').hover(function () {
            $(el).find(".detailText").css("color", $(el).css("background-color"));
            $(el).find($(".card_inner__content")).hide();
            $(this).css('z-index', "2000");
            $(this).addClass('animate');
            $(el).parent().find(".card").css("opacity", "1");
            setTimeout(function () {
                $(el).parent().find(".add_to_cart").css("pointer-events", "all");
                $(el).parent().find(".view_gallery").css("pointer-events", "all");
            }, 300);
            return false;
        }, function (e) {
            $(this).removeClass('animate');
            $(this).parent().css('z-index', "1");
            if (!$(this).hasClass("flip180") && !$(this).hasClass("animate") && !$(this).hasClass("flip-10") && !$(this).hasClass("flip90")) {
                $(el).find(".card_inner__content").slideDown();
                $(el).parent().find(".card").css("opacity", "0.8");
            }
            $(el).parent().find(".add_to_cart").css("pointer-events", "none");
            $(el).parent().find(".view_gallery").css("pointer-events", "none");
        });

        // Flip card to the back side
        $(el).find('.view_gallery').click(function () {
            $(el).find('.carousel').css("background", $(el).css("background-color"));
            $(el).find('.make3D').addClass('flip-10');
            setTimeout(function () {
                $(el).addClass("card_inner");
                $(el).find($(".card_inner__content")).hide();
                $(el).find($(".card_inner__header")).hide();
                $(el).find('.make3D').removeClass('flip-10').addClass('flip90').find('div.shadow').show().fadeTo(80, 1, function () {
                    $(el).find('.product-front, .product-front div.shadow').hide();
                });
            }, 50);

            setTimeout(function () {
                $(el).find('.make3D').removeClass('flip90').addClass('flip190');
                $(el).find('.product-back').show().find('div.shadow').show().fadeTo(90, 0);
                setTimeout(function () {
                    $(el).find('.make3D').removeClass('flip190').addClass('flip180').find('div.shadow').hide();
                    setTimeout(function () {
                        $(el).find('.make3D').css('transition', '100ms ease-out');
                        $(el).find('.cx, .cy').addClass('s1');
                        setTimeout(function () {
                            $(el).find('.cx, .cy').addClass('s2');
                        }, 100);
                        setTimeout(function () {
                            $(el).find('.cx, .cy').addClass('s3');
                        }, 200);
                    }, 100);
                }, 100);
            }, 150);
            return false;
        });

        // Flip card back to the front side
        $(el).find('.flip-back').click(function () {
            $(el).find($(".card_inner__content")).hide();
            $(el).find($(".card_inner__header")).slideDown();
            $(el).find('.make3D').removeClass('flip180').addClass('flip190');
            setTimeout(function () {
                $(el).find('.make3D').removeClass('flip190').addClass('flip90');

                $(el).find('.product-back div.shadow').css('opacity', 0).fadeTo(100, 1, function () {
                    $(el).find('.product-back, .product-back div.shadow').hide();
                    $(el).find('.product-front, .product-front div.shadow').show();
                });
            }, 50);

            setTimeout(function () {
                $(el).find('.make3D').removeClass('flip90').addClass('flip-10');
                $(el).find('.product-front div.shadow').show().fadeTo(100, 0);
                setTimeout(function () {
                    $(el).find('.product-front div.shadow').hide();
                    $(el).find('.make3D').removeClass('flip-10').css('transition', '100ms ease-out');
                    $(el).find('.cx, .cy').removeClass('s1 s2 s3');
                }, 100);
                setTimeout(function () {
                    $(el).removeClass("card_inner");
                    if (!$(el).is(":hover")) {
                        $(el).find($(".card_inner__content")).show();
                    }
                }, 200);
            }, 150);

        });
        colorize(el, day);
    });
}

function colorize(el, d) {
    var color;
    switch (d) {
        case 0:
            color = "#727b87";
            el.css("background", color);
            return color;
        case 1:
            color = "#f24949";
            el.css("background", color);
            return color;
        case 2:
            color = "#2f3e4e";
            el.css("background", color);
            return color;
        case 3:
            color = "#ff6622";
            el.css("background", color);
            return color;
        case 4:
            color = "#18aa63";
            el.css("background", color);
            return color;
        case 5:
            color = "#ba2442";
            el.css("background", color);
            return color;
        case 6:
            color = "#d2aa18";
            el.css("background", color);
            return color;
    }
}

function setActiveTab(index) {
    activeTab = index;
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