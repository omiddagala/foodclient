/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.emp-mobile-home', [])
        .config(routeConfig)
        .controller('empMobileHomeCtrl', empMobileHomeCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('emp-mobile-home', {
                url: '/emp-mobile-home',
                templateUrl: 'app/pages/employee/mobile/home/home.html',
                title: 'خانه',
                controller: empMobileHomeCtrl
            });
    }

    function empMobileHomeCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location, $uibModalStack) {
        $rootScope.currentMobileActiveMenu = "home";
        var tomorrow;
        $rootScope.foodType = $scope.foodType = $location.search().t ? $location.search().t : 'ALL';
        $rootScope.sortOrder = $location.search().so ? $location.search().so : 'low';
        var timepicker;
        var day;
        $scope.showDetails = true;
        $rootScope.resNameToSearch = "";
        $rootScope.fromPrice = 1000;
        $rootScope.toPrice = 1000000;
        $rootScope.pageTitle = 'رزرو غذا';
        $scope.headerImg = $rootScope.foodType === "ALL" ? '' : $rootScope.foodType;
        $scope.headerImgSrc = $scope.headerImg !== '' ? '../../../../assets/img/ui/mobile/' + $scope.headerImg + '.png' : '';

        $scope.loadContent = function (isFirstCall, isSearch) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params;
            // if called by page load and not search button
            if ((/[?&]/.test(location.hash) || location.hash === '#/emp-mobile-home') && !isSearch) {
                var dateUrlParam = $location.search().d ? $location.search().d : moment.utc(tomorrow).format('jYYYY/jM/jD');
                $scope.searchDate = dateUrlParam;
                day = moment.utc(dateUrlParam, 'jYYYY/jM/jD').day();
                var t = $location.search().ti ? $location.search().ti : "12 : 30";
                params = {
                    date: moment.utc(dateUrlParam + " " + t, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                    foodName: $location.search().n,
                    restaurantName: $location.search().r ? $location.search().r : "",
                    startPrice: $location.search().s ? $rootScope.fromPrice = $location.search().s : $rootScope.fromPrice,
                    endPrice: $location.search().e ? $rootScope.toPrice = $location.search().e : $rootScope.toPrice,
                    foodType: $location.search().t === 'ALL' ? null : $location.search().t,
                    justOff: $location.search().jo === "true",
                    pageableDTO: {
                        page: $rootScope.empPageNum,
                        size: $rootScope.isMobile() ? 8 : 16,
                        direction: 0,
                        sortBy: $location.search().so ? $location.search().so : 'low'
                    }
                };
                $('#taghvim').find('input').val(dateUrlParam);
                // and setting search inputs
                if (isFirstCall && /[?&]/.test(location.hash)) {
                    $('#justOff').prop('checked', params.justOff);
                    $('#foodName').val(params.foodName);
                    $('#resName_selected_title').text(!params.restaurantName ? "همه" : params.restaurantName);
                    $rootScope.resNameToSearch = params.restaurantName;
                    if (!$rootScope.isMobile()) {
                        var slider = $("#range").data("ionRangeSlider");
                        slider.update({
                            from: params.startPrice,
                            to: params.endPrice
                        });
                    }

                    $scope.foodType = $rootScope.foodType = params.foodType ? params.foodType : 'ALL';
                    $rootScope.sortOrder = params.pageableDTO.sortBy;
                    $('#dateForOrder').val(dateUrlParam);
                }
            } else {
                // if is called from search button

                var datetime = $('#taghvim').find('input').val();
                var time = $('.timepicker').wickedpicker('time');
                var date = moment.utc(datetime + " " + time, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ');
                day = moment.utc(datetime, 'jYYYY/jM/jD').day();
                var off = $('input[name="justOff"]:checked').length > 0;
                var foodtype = window.isMobile() ? $rootScope.selectedCategory : ($rootScope.foodType === 'ALL' ? null : $rootScope.foodType);
                params = {
                    date: date,
                    foodName: $('#foodName').val(),
                    restaurantName: $rootScope.resNameToSearch,
                    startPrice: $rootScope.fromPrice,
                    endPrice: $rootScope.toPrice === 70000 ? 1000000 : $rootScope.toPrice,
                    foodType: foodtype,
                    justOff: off,
                    pageableDTO: {
                        page: $rootScope.empPageNum,
                        size: $rootScope.isMobile() ? 8 : 16,
                        direction: 0,
                        sortBy: $rootScope.sortOrder
                    }
                };
                if (isSearch && !$rootScope.isMobile()) {
                    $location.search('d', datetime);
                    $location.search('n', params.foodName);
                    $location.search('r', params.restaurantName);
                    $location.search('s', params.startPrice);
                    $location.search('e', params.endPrice);
                    $location.search('t', params.foodType);
                    $location.search('ti', time);
                    $location.search('so', $rootScope.sortOrder);
                    $location.search('jo', off.toString());
                }
            }
            $http.post("http://127.0.0.1:9000/v1/foodSearch/find", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data.length > 0) {
                        $scope.setDateForCardsAndDetail();
                        if (params.pageableDTO.page === 0) {
                            $rootScope.foods = [];
                            setTimeout(function () {
                                $rootScope.foods = data;
                                $rootScope.$apply();
                            }, 200);
                        } else {
                            $.merge($rootScope.foods, data);
                        }

                        if (data.length === params.pageableDTO.size) {
                            $rootScope.empPageNum++;
                            $rootScope.enableScroll = true;
                        }
                    } else {
                        if (params.pageableDTO.page === 0) {
                            $rootScope.foods = [];
                        }
                    }
                }).catch(function (err) {
                $rootScope.handleError(params, "foodSearch/find", err, httpOptions);
            });
        };

        $scope.homeInit = function () {
            $rootScope.empPageNum = 0;
            $scope.commentPageNum = 0;
            $rootScope.enableScroll = false;
            $rootScope.enableCommentScroll = true;
            $rootScope.foods = [];
            setTimeout(function () {
                tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                initClock();
                $scope.loadContent(true, false);
                $('.article-mobile-list').scroll(function () {
                    if ($rootScope.scrollIsAtEnd($('.article-mobile-list'))) {
                        if ($rootScope.enableScroll) {
                            $rootScope.enableScroll = false;
                            $scope.loadContent(false, true)
                        }
                    }
                });
                checkMyGift();
            }, 700);
            setTimeout(function () {
                var slider = $("#range");
                if (slider)
                    slider.on("change", function () {
                        $rootScope.fromPrice = $(this).data("from");
                        $rootScope.toPrice = $(this).data("to");
                    });
            }, 1500);
        };
        $scope.setDateForCardsAndDetail = function () {
            var searchedDate = $('#dateForOrder').val();
            var t = searchedDate ? searchedDate : $('#taghvim').find('input').val();
            moment.loadPersian({dialect: 'persian-modern'});
            var time = $("#searchTime").val().replace(/\s/g, '');
            $rootScope.dateToOrder = moment.utc(t + " " + time, 'jYYYY/jM/jD HH:mm');
            var m = $rootScope.dateToOrder.format('LLLL');
            $rootScope.dateToShowOnCards = m.split(" ").slice(0, 3).join(" ");
            $rootScope.timeToShowOnCards = time;
            var today = moment.utc(new Date());
            $scope.diffDaysForOff = $rootScope.dateToOrder.diff(today, 'days');
        };

        //vahid seraj updated code. (1397.09.29) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        };

        function checkMyGift() {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                direction: 'DESC',
                page: 0,
                size: 1,
                sortBy: 'creationDate'
            };
            $http.post("http://127.0.0.1:9000/v1/employee/newGiftList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    if (data.data.list.length > 0) {
                        $uibModal.open({
                            animation: true,
                            templateUrl: 'app/pages/employee/home/manager-gift-modal.html',
                            size: 'lg',
                            scope: $scope
                        });
                        $scope.gift = data.data.list[0];
                        $http.post("http://127.0.0.1:9000/v1/employee/setGiftVisited", {"id": $scope.gift.id}, httpOptions)
                            .then(function (data, status, headers, config) {
                            }).catch(function (err) {
                        });
                    }
                }).catch(function (err) {
            });
        }

        $scope.getGiftType = function (type) {
            switch (type) {
                case 'BIRTHDAY':
                    return "تبریک تولد";
                case 'GOOD_JOB':
                    return "کارت خوب بود";
                case 'ONTIME':
                    return "حضور به موقع";
                case 'FORMAL_WARE':
                    return "پوشش اداری";
                case 'OFFICIAL_MANNER':
                    return "رفتار اداری مناسب";
            }
        };

        function initClock() {
            var t = $location.search().ti ? $location.search().ti : "12 : 30";
            var options = {
                now: t, //hh:mm 24 hour format only, defaults to current time
                close: 'wickedpicker__close', //The close class selector to use, for custom CSS
                twentyFour: true,
                title: 'انتخاب ساعت', //The Wickedpicker's title,
                showSeconds: false, //Whether or not to show seconds,
                timeSeparator: ' : ', // The string to put in between hours and minutes (and seconds)
                secondsInterval: 1, //Change interval for seconds, defaults to 1,
                minutesInterval: 30, //Change interval for minutes, defaults to 1
            };
            timepicker = $('.timepicker').wickedpicker(options);
        }

        $scope.getPersianDay = function (d) {
            switch (d) {
                case 0:
                    return "یکشنبه";
                case 1:
                    return "دوشنبه";
                case 2:
                    return "سه شنبه";
                case 3:
                    return "چهارشنبه";
                case 4:
                    return "پنجشنبه";
                case 5:
                    return "جمعه";
                case 6:
                    return "شنبه";
            }
        };

        $scope.formatMyTime = function (d) {
            var rt;
            switch (d.toString().length) {
                case 1:
                    rt = "000" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 2:
                    rt = "00" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 3:
                    rt = "0" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 4:
                    rt = d.toString();
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
            }
        };

        $scope.open = function (page, size) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.orderFood = function (foodId, date, count, f) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: date,
                foodId: foodId,
                count: count
            };
            $http.post("http://127.0.0.1:9000/v1/employee/order", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.userBalance = data.availableBalanceAmount;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    if (f)
                        f.count++;
                    stopLoading();
                }).catch(function (err) {
                setTimeout(function () {
                    $scope.loadOrders();
                }, 2000);
                $rootScope.handleError(params, "/employee/order", err, httpOptions);
            });
        };

        $scope.foodTypeChanged = function (t) {
            $rootScope.foodType = t;
            $scope.search();
        };

        $rootScope.sortOrderChanged = function (t) {
            $rootScope.sortOrder = t;
            $scope.search();
        };

        $scope.confirm = function (e) {
            var ionSideMenu = $(e.currentTarget).closest('ion-side-menus');
            $(ionSideMenu).find('ion-side-menu .confirm-box').removeClass('confirm-box-disable');
            window.setTimeout(function () {
                $(ionSideMenu).find('ion-side-menu .confirm-box').addClass('confirm-box-disable');
                $rootScope.sortBox();
                $rootScope.empPageNum = 0;
                $scope.loadContent(false, true);
            }, 600);
        };

        $scope.myFormatDate = function (d) {
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            return moment.utc(d).format('LLLL');
        };

        $scope.showFoodDetail = function (food) {
            $location.path('/emp-mobile-detail').search({
                id: food.id,
                d: $rootScope.dateToShowOnCards,
                t: $rootScope.timeToShowOnCards
            });
        };
        $scope.cardsBottomOrderFoodAction = function ($event, food) {
            $scope.orderFood(food.id, $rootScope.dateToOrder.format('YYYY-MM-DDTHH:mmZ'), 1);
        };
    }
})();

