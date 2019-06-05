/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.home', [])
        .config(routeConfig)
        .controller('homeCtrl', homeCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: window.isMobile() ? 'app/pages/employee/home/m.home.html' : 'app/pages/employee/home/home.html',
                title: 'خانه',
                controller: homeCtrl
            });
    }

    function homeCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location, $uibModalStack) {
        $rootScope.currentMobileActiveMenu = "home";
        var tomorrow;
        $rootScope.foodType = $scope.foodType = $location.search().t ? $location.search().t : 'ALL';
        $rootScope.sortOrder = $location.search().so ? $location.search().so : 'low';
        $rootScope.isMainFood = true;
        var timepicker;
        var lastTime;
        var day;
        $scope.showDetails = true;
        $rootScope.resNameToSearch = "";
        $rootScope.fromPrice = 1000;
        $rootScope.toPrice = 1000000;
        $rootScope.pageTitle = 'رزرو غذا';
        $scope.headerImg = $rootScope.foodType === "ALL" ? '' : $rootScope.foodType;
        $scope.headerImgSrc = $scope.headerImg !== '' ? '../../../../assets/img/ui/mobile/' + $scope.headerImg + '.png' : '';

        $scope.$on('$locationChangeStart', function () {
            if ($scope.onBrowserBackLeaveDDA) {
                $scope.cancelDessert();
                $location.search('dda', null);
                $scope.onBrowserBackLeaveDDA = false;
            }
            if ($location.search().dda === 'dda') {
                $scope.onBrowserBackLeaveDDA = true;
            }
            var a = location.href;
            $rootScope.employee_params = a.substring(a.indexOf("?") + 1);
        });

        $scope.loadContent = function (isFirstCall, isSearch) {

            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params;
            // if called by page load and not search button
            if ((/[?&]/.test(location.hash) || location.hash === '#/home') && !isSearch) {
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
            if ($rootScope.employee_params && !$rootScope.isMobile())
                $location.search($rootScope.employee_params);
            $location.search('dda', null);
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
                $scope.loadOrders();
                if (!$rootScope.isMobile()) {
                    $('.main-stage > div').scroll(function () {
                        if ($rootScope.scrollIsAtEnd($('.main-stage > div'))) {
                            if ($rootScope.enableScroll && $rootScope.isMainFood) {
                                $rootScope.enableScroll = false;
                                $scope.loadContent(false, true)
                            }
                        }
                    });
                } else {
                    $('.article-mobile-list').scroll(function () {
                        if ($rootScope.scrollIsAtEnd($('.article-mobile-list'))) {
                            if ($rootScope.enableScroll && $rootScope.isMainFood) {
                                $rootScope.enableScroll = false;
                                $scope.loadContent(false, true)
                            }
                        }
                    });
                }
                checkMyGift();
                loadRestaurants();
            }, 700);
            setTimeout(function () {
                var slider = $("#range");
                if (slider)
                    slider.on("change", function () {
                        $rootScope.fromPrice = $(this).data("from");
                        $rootScope.toPrice = $(this).data("to");
                        if (!$rootScope.isMobile())
                            $scope.search()
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
        }

        //vahid seraj updated code. (1397.09.29) ------------- [end]
        function loadRestaurants() {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/employee/findRestaurantNames", null, httpOptions)
                .then(function (data, status, headers, config) {
                    setTimeout(function () {
                        $scope.restNames = data.data;
                        $scope.$apply();
                    }, 1000);
                }).catch(function (err) {
            });
        }

        $scope.resName_changed = function (r) {
            var temp = r !== 0 ? $("#resName-" + r).text() : "";
            if ($rootScope.resNameToSearch === temp)
                return;
            $rootScope.resNameToSearch = temp;
            $("#resName_selected_title").text(!$rootScope.resNameToSearch ? "همه" : $rootScope.resNameToSearch);
            $scope.search();
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
            if (!$rootScope.isMobile()) {
                var st = $('#searchTime');
                lastTime = t;
                st.change(function () {
                    if (lastTime !== st.val()) {
                        $scope.search();
                        lastTime = st.val();
                    }
                });
            }
        }

        var delayTimer;
        $scope.search = function (dateChanged) {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                $('.main-stage > div').animate({
                    scrollTop: 0
                }, 'fast');
                $rootScope.empPageNum = 0;
                var t = $('#taghvim').find('input').val();
                $("#dateForOrder").val(t);
                $scope.loadContent(false, true);
                if (dateChanged) {
                    $('.cart').empty();
                    $rootScope.orderids = [];
                    $rootScope.cartItems = new HashMap();
                    $scope.initOrderWithCount();
                    $scope.renderTodaysReserves();
                }
            }, 1000);
        };

        $scope.addToTodayReserves = function (name, day, id, resId, foodType, restName, count) {
            var todaysKey = moment.utc(day).format("MM-DD-YYYY");
            var todays = {
                name: name,
                day: day,
                id: id,
                resId: resId,
                foodType: foodType,
                restName: restName,
                addedLocally: false,
                count: count
            };
            var elem = $rootScope.reservesPerDay.get(todaysKey);
            if (!elem) {
                $rootScope.reservesPerDay.set(todaysKey, [todays]);
            } else {
                for (var i = 0; i < elem.length; i++) {
                    if (elem[i].id === todays.id) {
                        elem[i].count = elem[i].count + count;
                        return;
                    }
                }
                elem.push(todays);
            }
        };

        $scope.removeFromTodayReserves = function (day, id, count) {
            var todaysKey = moment.utc(day).format("MM-DD-YYYY");
            var elem = $rootScope.reservesPerDay.get(todaysKey);
            var deletedItem;
            if (elem) {
                for (var i = 0; i < elem.length; i++) {
                    if (elem[i].id === id) {
                        elem[i].count = elem[i].count - count;
                        if (elem[i].count === 0) {
                            deletedItem = elem[i];
                            elem.splice(i, 1);
                        }
                        break;
                    }
                }
                // delete all DDAs of this restaurant if this was the only main food of that restaurant in that time
                if (deletedItem && deletedItem.foodType !== "DDA") {
                    for (var j = 0; j < elem.length; j++) {
                        if (elem[j].resId === deletedItem.resId && elem[j].day === deletedItem.day && elem[j].foodType !== "DDA") {
                            return;
                        }
                    }
                    elem = jQuery.grep(elem, function(value) {
                        return value.resId !== deletedItem.resId || value.day !== deletedItem.day;
                    });
                    $rootScope.reservesPerDay.set(todaysKey, elem);
                    $('.cart').empty();
                    $rootScope.orderids = [];
                    $rootScope.cartItems = new HashMap();
                    $scope.initOrderWithCount();
                    $scope.renderTodaysReserves();
                }
            }
        };

        $scope.renderTodaysReserves = function () {
            $rootScope.orderids = [];
            var t = $('#taghvim').find('input').val();
            var key = moment.utc(t, 'jYYYY/jM/jD').format("MM-DD-YYYY");
            var todays = $rootScope.reservesPerDay.get(key);
            if (todays) {
                for (var i = 0; i < todays.length; i++) {
                    $scope.createOrderCart(todays[i].name, moment.utc(todays[i].day).format('YYYY-MM-DDTHH:mmZ'), todays[i].id, todays[i].resId, todays[i].foodType, todays[i].restName, todays[i].addedLocally, todays[i].count);
                }
            } else {
                $('.cart').empty();
            }
        };

        $scope.forms = {};

        $scope.foodDetail = function () {
            if ($scope.forms.myform)
                $scope.forms.myform.$setPristine();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.food.id
            };
            $http.post("http://127.0.0.1:9000/v1/food/getFoodAvailableDates", params, httpOptions)
                .success(function (data, status, headers, config) {
                    var m = new HashMap();
                    for (var i = 0; i < data.length; i++) {
                        var day = m.get(data[i].dayOfWeek);
                        if (!day) {
                            m.set(data[i].dayOfWeek, [{startTime: data[i].startTime, endTime: data[i].endTime}]);
                        } else {
                            day.push({startTime: data[i].startTime, endTime: data[i].endTime});
                        }
                    }
                    $scope.days = m;
                }).catch(function (err) {
                $rootScope.handleError(params, "/food/getFoodAvailableDates", err, httpOptions);
            });
        };


        $scope.myRate = function (rate) {
            startLoading();
            $scope.updateStar(rate);
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "foodId": $scope.food.id,
                "rate": rate
            };
            $http.post("http://127.0.0.1:9000/v1/employee/rate", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/rate", err, httpOptions);
            });
        };

        $scope.updateStar = function (s) {
            $scope.stars = [];
            for (var i = 0; i < 5; i++) {
                $scope.stars.push({
                    filled: i < s
                });
            }
        };

        $scope.loadYourLastRateToThisFood = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.food.id
            };
            $http.post("http://127.0.0.1:9000/v1/employee/lastRate", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.foodRate = data.rate === 0 ? "-" : data.rate;
                    $scope.updateStar(data.rate);
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/lastRate", err, httpOptions);
            });
        };

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

        $scope.addComments = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                foodId: $scope.food.id,
                comment: $('#commentInDetail').val()
            };
            $http.post("http://127.0.0.1:9000/v1/foodComment/add", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/foodComment/add", err, httpOptions);
            });
        };

        $scope.cleanComments = function () {
            $scope.comments = [];
            $scope.commentPageNum = 0;
        };

        $scope.toggleComments = function () {
            $("#food_comments").slideToggle();
            $("#comment_toggle_icon").toggleClass("rotate_90_degrees");
        };

        $scope.fetchComments = function () {
            startLoading();
            $("#commentInDetail").val("");
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.food.id,
                pageableDTO: {
                    page: $scope.commentPageNum,
                    size: 10,
                    direction: 0,
                    sortBy: "date"
                }
            };
            $http.post("http://127.0.0.1:9000/v1/foodComment/getFoodComments", params, httpOptions)
                .success(function (data, status, headers, config) {
                    if (data.length > 0) {
                        Array.prototype.push.apply($scope.comments, data);
                        $rootScope.enableCommentScroll = true;
                        if ($scope.commentPageNum === 0) {
                            setTimeout(function () {
                                var comments_div = $("#food_comments");
                                comments_div.off("scroll");
                                comments_div.on("scroll", function () {
                                    if ($rootScope.scrollIsAtEnd(comments_div) && $rootScope.enableCommentScroll && $scope.comments.length % params.pageableDTO.size === 0) {
                                        $rootScope.enableCommentScroll = false;
                                        $scope.commentPageNum++;
                                        $scope.fetchComments();
                                    }
                                })
                            }, 200);
                        }
                    } else {
                        if ($scope.commentPageNum === 0) {
                            $scope.toggleComments();
                        }
                    }
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/foodComment/getFoodComments", err, httpOptions);
            });
        };

        $scope.open = function (page, size) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };
        $scope.openProgressDialog = baProgressModal.open;
        var timelineBlocks = $('.cd-timeline-block'),
            offset = 0.8;

        //hide timeline blocks which are outside the viewport
        hideBlocks(timelineBlocks, offset);

        //on scolling, show/animate timeline blocks when enter the viewport
        $(window).unbind('scroll');
        $(window).on('scroll', function () {
            if (!window.requestAnimationFrame) {
                setTimeout(function () {
                    hideBlocks(timelineBlocks, offset);
                    showBlocks(timelineBlocks, offset);
                }, 100);
            } else {
                window.requestAnimationFrame(function () {
                    hideBlocks(timelineBlocks, offset);
                    showBlocks(timelineBlocks, offset);
                });
            }
        });

        function hideBlocks(blocks, offset) {
            blocks.each(function () {
                ($(this).offset().top > $(window).scrollTop() + window.innerHeight * offset) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
            });
        }

        function showBlocks(blocks, offset) {
            blocks.each(function () {
                ($(this).offset().top <= $(window).scrollTop() + window.innerHeight * offset && $(this).find('.cd-timeline-img').hasClass('is-hidden')) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
            });
        }

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

        $scope.cancelFood = function (foodId, date, count, f) {
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
            $http.post("http://127.0.0.1:9000/v1/employee/cancelOrderByOrderDTO", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.userBalance = data.availableBalanceAmount;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    if (f)
                        f.count--;
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/cancelOrderByOrderDTO", err, httpOptions);
                $scope.loadOrders();
            });
        };

        $scope.cancelAllFood = function (foodId, date, orderId, f) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: date,
                foodId: foodId
            };
            $http.post("http://127.0.0.1:9000/v1/employee/cancelOrderByOrderDTOList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.userBalance = data.availableBalanceAmount;
                    for (var i = 0; i < $rootScope.orderids.length; i++) {
                        if ($rootScope.orderids[i] === orderId) {
                            $rootScope.orderids.splice(i, 1);
                        }
                    }
                    $scope.initOrderWithCount();
                    if (f)
                        $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/cancelOrderByOrderDTOList", err, httpOptions);
                $scope.loadOrders();
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

        var orderId;
        $scope.loadOrders = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                pageableDTO: {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "deliveryDate"
                }
            };
            $http.post("http://127.0.0.1:9000/v1/employee/getOrderList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    data = data.list;
                    $('.cart').empty();
                    $rootScope.orderids = [];
                    $rootScope.cartItems = new HashMap();
                    $rootScope.reservesPerDay = new HashMap();
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < data[i].foodOrders.length; j++) {
                            $scope.addToTodayReserves(data[i].foodOrders[j].food.name,
                                data[i].deliveryDate,
                                data[i].foodOrders[j].food.id, data[i].restaurant.id, data[i].foodOrders[j].food.foodType, data[i].restaurant.name, data[i].foodOrders[j].count);
                        }
                    }
                    $scope.renderTodaysReserves();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/getOrderList", err, httpOptions);
            });
        };

        $scope.createOrderCart = function (name, day, id, resId, foodType, restName, addedLocally, count) {
            var cartItem;
            moment.locale('fa');
            var d = moment.utc(day, 'YYYY-MM-DDTHH:mmZ');
            orderId = d.format('YYYY-MM-DDTHH:mmZ') + id;
            if (jQuery.inArray(orderId, $rootScope.orderids) < 0) {
                moment.loadPersian({dialect: 'persian-modern'});
                var d2 = d.format("LLLL");
                var d3 = d2.substr(0, d2.lastIndexOf(' '));
                var t = d2.substr(d2.lastIndexOf(' '));
                $rootScope.orderids.push(orderId);
                cartItem = '<div id="' + orderId + '" class="animated zoomIn omidProduct newsabad_cards" data-orderdate="' + d.format() + '" data-delivery="' + day + '" data-foodid="' + id + '" data-resid="' + resId + '" data-foodtype="' + foodType + '" data-restname="' + restName + '" data-foodname="' + name + '" data-quantity="' + count + '">' +
                    '<div class="product-preview">' +
                    // '<div class="thumbnail"><img class="image" src="' + productImage + '"/></div>' +
                    '<div class="product-paper">' +
                    '<div class="product-name" style="font-size: small;padding-top: 7px;color: #1a4049">' +
                    name +
                    '</div>' +
                    '<div class="product-name" style="color: #2e6977">' +
                    restName +
                    '</div>' +
                    '<div class="product-quantity">' + count + '</div>' +
                    '<div class="product-date">' +
                    d3 +
                    '</div>' +
                    '<div class="product-date">' +
                    "ساعت " + t +
                    '</div>' +
                    '</div></div>' +
                    '<div class="product-interactions"><div ng-click="dessert($event,' + resId + ')" style="background-image: url(/assets/img/ui/dessert.png);background-size: 16px 26px" class="button">' +
                    '</div><div class="button" style="background-image: url(/assets/img/ui/add-food.png)" ng-click="productPlusWithButton($event)">' +
                    '</div>' +
                    '<div class="button" style="background-image: url(/assets/img/ui/rem-food.png);background-position: top" ng-click="productMinusWithButton($event)">' +
                    '</div>' +
                    '</div>';
                cartItem += '</div>';
                cartItem = $compile(cartItem)($scope);
                if (addedLocally) {
                    $(cartItem).find(".product-interactions").css("opacity", "1");
                    $(cartItem).find(".product-interactions").css("-webkit-transform", "none");
                    $(cartItem).find(".product-interactions").css("transform", "none");
                }
                $(cartItem).hover(function () {
                    $(cartItem).find(".product-interactions").css("opacity", "0");
                    $(cartItem).find(".product-interactions").css("-webkit-transform", "perspective(600px) rotateY(90deg)");
                    $(cartItem).find(".product-interactions").css("transform", "perspective(600px) rotateY(90deg)");
                });
                var dataWasAdded = false;
                $('.cart').children().each(function (i) {
                    var deliveryDate = moment.utc($(this).data('orderdate'));
                    if (d.isBefore(deliveryDate) || d.isSame(deliveryDate)) {
                        $(this).before(cartItem);
                        dataWasAdded = true;
                        return false;
                    }
                });
                if (!dataWasAdded) {
                    $('.cart').append(cartItem);
                }
                $rootScope.cartItems.set(orderId, cartItem);
            } else {
                cartItem = $rootScope.cartItems.get(orderId);
                var plus = {
                    currentTarget: $(cartItem).find('.product-quantity')
                };
                $scope.productPlus(plus, true);
            }
        };

        $scope.dessert = function ($event, resId) {
            if ($location.search().dda === 'dda')
                return;
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var product = $($event.currentTarget).closest('.omidProduct');
            var date = product.data("orderdate");
            var datetime = moment.utc(date, 'YYYY-MM-DDTHH:mmZ').format('jYYYY/jM/jD HH:mm');
            $("#dateForOrder").val(datetime);
            var params = {
                "date": date,
                "pageableDTO": {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "id"
                },
                "restaurantId": resId
            };
            $http.post("http://127.0.0.1:9000/v1/foodSearch/getRestaurantDDA", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.isMainFood = false;
                    $rootScope.empPageNum = 0;
                    $rootScope.foods = data;
                    $scope.onBrowserBackLeaveDDA = false;
                    $location.search('dda', 'dda');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/foodSearch/getRestaurantDDA", err, httpOptions);
            });
        };

        $scope.cancelDessert = function () {
            $('.main-stage > div').animate({
                scrollTop: 0
            }, 'fast');
            $rootScope.isMainFood = true;
            $rootScope.empPageNum = 0;
            var t = $('#taghvim').find('input').val();
            $("#dateForOrder").val(t);
            $location.search('dda', null);
            $scope.onBrowserBackLeaveDDA = true;
            $scope.loadContent(false, true);
        };
        $scope.confirm = function (e) {
            $rootScope.hideBackButton = false;
            var ionSideMenu = $(e.currentTarget).closest('ion-side-menus');
            $(ionSideMenu).find('ion-side-menu .confirm-box').removeClass('confirm-box-disable');
            window.setTimeout(function () {
                $(ionSideMenu).find('ion-side-menu .confirm-box').addClass('confirm-box-disable');
                $rootScope.sortBox();
                $rootScope.empPageNum = 0;
                $scope.loadContent(false, true);
            }, 600);
        };

        $scope.orderList = function () {
            startLoading();
            $scope.initOrderWithCount();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                pageableDTO: {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "deliveryDate"
                }
            };
            $http.post("http://127.0.0.1:9000/v1/employee/getOrderList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    data = data.list;
                    var map = new HashMap();
                    for (var i = 0; i < data.length; i++) {
                        var existVal = map.get(data[i].deliveryDate);
                        if (existVal) {
                            if (!data[i].totalContainerPrice) {
                                data[i].totalContainerPrice = 0;
                                data[i].totalTaxAmount = 0;
                                data[i].totalAmount = 0;
                            }
                            for (var j = 0; j < data[i].foodOrders.length; j++) {
                                data[i].totalContainerPrice += data[i].foodOrders[j].containerPrice;
                                data[i].totalTaxAmount += data[i].foodOrders[j].taxAmount;
                                data[i].totalAmount += data[i].foodOrders[j].totalPrice;
                            }
                            data[i].totalAmount += data[i].deliveryPrice;
                            existVal.restaurants.push(data[i]);
                        } else {
                            var newVal = {
                                restaurants: [],
                                dayDate: null,
                                id: data[i].id,
                                desc: data[i].description
                            };
                            data[i].totalContainerPrice = 0;
                            data[i].totalTaxAmount = 0;
                            data[i].totalAmount = 0;
                            for (var k = 0; k < data[i].foodOrders.length; k++) {
                                data[i].totalContainerPrice += data[i].foodOrders[k].containerPrice;
                                data[i].totalTaxAmount += data[i].foodOrders[k].taxAmount;
                                data[i].totalAmount += data[i].foodOrders[k].totalPrice;
                            }
                            data[i].totalAmount += data[i].deliveryPrice;
                            newVal.restaurants.push(data[i]);
                            newVal.dayDate = data[i].deliveryDate;
                            map.set(data[i].deliveryDate, newVal);
                        }
                    }
                    $rootScope.mydays = map.values();
                    stopLoading();
                    $scope.open('app/pages/employee/home/selected.html', 'lg');
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/getOrderList", err, httpOptions);
            });
        };

        $scope.addFoodInReservePopup = function (f, r, d) {
            $scope.food = {
                name: f.food.name,
                id: f.food.id,
                foodType: f.food.foodType,
                restaurant: {
                    name: r.name,
                    id: r.id
                },
                date: d
            };
            $scope.foodDetailOrder(f);
        };

        $scope.minusFoodInReservePopup = function (f, d) {
            $scope.food = {
                name: f.food.name,
                id: f.food.id,
                foodType: f.food.foodType
            };
            var key = moment.utc(d).format('YYYY-MM-DDTHH:mmZ') + $scope.food.id;
            var card = $rootScope.cartItems.get(key);
            if ($scope.lastElement && $scope.lastElement.attr("id") === card.attr("id")) {
                $scope.lastCount++;
                if ($scope.lastCount >= 2) {
                    $uibModalStack.dismissAll();
                    $scope.extraq = card.data("quantity");
                    $scope.open('app/pages/employee/home/foodcounts.html', "sm");
                    return;
                }
            } else {
                $scope.lastElement = card;
                $scope.lastCount = 0;
            }
            $scope.removeFromTodayReserves(d, f.food.id, 1);
            if (card) {
                if (f.count === 1) {
                    $scope.productDel(key);
                } else {
                    var q = Math.max(1, f.count - 1);
                    card.data('quantity', q);
                    $scope.updateProduct(card);
                }
            }
            if (f.count === 1) {
                $scope.cancelAllFood(f.food.id, d, key, f);
            } else {
                $scope.cancelFood(f.food.id, d, 1, f);
            }
        };

        $scope.foodDetailOrder = function (f) {
            var d = moment.utc($rootScope.dateToOrder);
            var product = $rootScope.cartItems.get(d.format('YYYY-MM-DDTHH:mmZ') + $scope.food.id);
            if (product) {
                if ($scope.lastElement && $scope.lastElement.attr("id") === product.attr("id")) {
                    $scope.lastCount++;
                    if ($scope.lastCount >= 2) {
                        $uibModalStack.dismissAll();
                        $scope.extraq = product.data("quantity");
                        $scope.open('app/pages/employee/home/foodcounts.html', "sm");
                        return;
                    }
                } else {
                    $scope.lastElement = product;
                    $scope.lastCount = 0;
                }
            }
            $scope.createOrderCart($scope.food.name, d.format('YYYY-MM-DDTHH:mmZ'), $scope.food.id, Number($scope.food.restaurant.id), $scope.food.foodType, $scope.food.restaurant.name, true, 1);
            $scope.addToTodayReserves($scope.food.name, d, $scope.food.id, Number($scope.food.restaurant.id), $scope.food.foodType, $scope.food.restaurant.name, 1);
            $scope.orderFood($scope.food.id, d.format('YYYY-MM-DDTHH:mmZ'), 1, f);
        };

        $scope.myFormatDate = function (d) {
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            return moment.utc(d).format('LLLL');
        };
        $scope.getDayOfWeek = function (d) {
            return d.substring(0, d.indexOf(" ") - 1);
        };
        $scope.getHour = function (d) {
            return d.substring(d.lastIndexOf(' '));
        };
        $scope.getDay = function (d) {
            return d.substring(d.indexOf(' '), d.lastIndexOf(' '));
        };

        $scope.productPlusWithButton = function ($event) {
            if ($scope.wasClicked !== "leftCards") {
                $scope.initOrderWithCount();
                $scope.wasClicked = "leftCards";
            }
            $scope.productPlus($event, false);
        };

        $scope.productMinusWithButton = function ($event) {
            if ($scope.wasClicked !== "leftCards") {
                $scope.initOrderWithCount();
                $scope.wasClicked = "leftCards";
            }
            $scope.productMinus($event);
        };

        $scope.initOrderWithCount = function () {
            $scope.lastElement = null;
            $scope.lastCount = 0;
        };

        $scope.submitProductCountModal = function (count) {
            if ($scope.lastElement.data("quantity") === count)
                return;
            $uibModalStack.dismissAll();
            if (count === 0) {
                $scope.cancelAllFood($scope.lastElement.data("foodid"), $scope.lastElement.data("orderdate"), $scope.lastElement.attr("id"));
                $scope.removeFromTodayReserves(moment.utc($scope.lastElement.data("orderdate")), $scope.lastElement.data("foodid"), $scope.lastElement.data("quantity"));
                $scope.productDel($scope.lastElement.attr("id"));
                return;
            }
            if ($scope.lastElement.data("quantity") < count) {
                $scope.doProductPlus($scope.lastElement, count, false);
            } else {
                $scope.doProductMinus($scope.lastElement, count);
            }
        };

        $scope.lastElement = null;
        $scope.lastCount = 0;

        $scope.productPlus = function ($event, isNotPlusButton) {
            var product = $($event.currentTarget).closest('.omidProduct');
            if ($scope.lastElement && $scope.lastElement.attr("id") === product.attr("id")) {
                if ($scope.wasClicked === "leftCards") {
                    $scope.lastCount++;
                    if ($scope.lastCount >= 2) {
                        $scope.extraq = product.data("quantity");
                        $scope.open('app/pages/employee/home/foodcounts.html', "sm");
                        return;
                    }
                }
            } else {
                $scope.lastElement = product;
                $scope.lastCount = 0;
            }
            $scope.doProductPlus(product, null, isNotPlusButton);
        };

        $scope.doProductPlus = function (product, count, isNotPlusButton) {
            var q = product.data('quantity');
            if (!isNotPlusButton) {
                var foodid = product.data("foodid");
                var orderdate = product.data("orderdate");
                var foodname = product.data("foodname");
                var resid = product.data("resid");
                var foodtype = product.data("foodtype");
                var restname = product.data("restname");
                $scope.addToTodayReserves(foodname, moment.utc(orderdate), foodid, resid, foodtype, restname, count ? count - q : 1);
                $scope.orderFood(foodid, orderdate, count ? count - q : 1);
            }
            product.data('quantity', count ? count : q + 1);
            $scope.updateProduct(product);
        };

        $scope.productMinus = function ($event) {
            var product = $($event.currentTarget).closest('.omidProduct');
            if (product.data("quantity") !== 1 && $scope.lastElement && $scope.lastElement.attr("id") === product.attr("id")) {
                if ($scope.wasClicked === "leftCards") {
                    $scope.lastCount++;
                    if ($scope.lastCount >= 2) {
                        $scope.extraq = product.data("quantity");
                        $scope.open('app/pages/employee/home/foodcounts.html', "sm");
                        return;
                    }
                }
            } else {
                $scope.lastElement = product;
                $scope.lastCount = 0;
            }
            $scope.doProductMinus(product);
        };

        $scope.doProductMinus = function (product, count) {
            var pq = product.data('quantity');
            $scope.removeFromTodayReserves(moment.utc(product.data("orderdate")), product.data("foodid"), count ? pq - count : 1);
            if (!count && pq === 1) {
                $scope.cancelAllFood(product.data("foodid"), product.data("orderdate"), product.attr("id"));
                $scope.productDel(product.attr("id"));
            } else {
                $scope.cancelFood(product.data("foodid"), product.data("orderdate"), count ? pq - count : 1);
                var q = Math.max(1, count ? count : pq - 1);
                product.data('quantity', q);
                $scope.updateProduct(product);
            }
        };

        $scope.updateProduct = function (product) {
            var quantity = product.data('quantity');
            $('.product-quantity', product).text(quantity);
        };

        $scope.productDel = function (id) {
            var product = $($rootScope.cartItems.get(id));
            product.hide('blind', {direction: 'left'}, 500, function () {
                product.remove();
                if ($('.product').length === 0) {
                    $('.cart-container .cart').hide();
                    $('.cart-container .empty').show();
                }
            });
        };

        $scope.hook = $('.icon-hook');

        $scope.addFoodDesc = function (id, index) {
            var desc = $("#orderDesc_" + index).val();
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: id,
                comment: desc
            };
            $http.post("http://127.0.0.1:9000/v1/employee/addOrderDescription", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/addOrderDescription", err, httpOptions);
            });
        };
        $scope.validateSubmitMin = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length >= 2;
        };
        $scope.validateSubmitMax = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length <= 250;
        };
        $scope.getFoodDetailDaysClass = function (d) {
            var i = (new Date()).getDay();
            if (d === i) {
                return "food_detail_days_title_today";
            } else {
                return "food_detail_days_title";
            }
        };
        $scope.toggleDetailShow = function () {
            if ($scope.showDetails) {
                $(".newmodal_body_header").text("نمایش با جزییات");
                $scope.showDetails = false;
            } else {
                $(".newmodal_body_header").text("نمایش کلی");
                $scope.showDetails = true;
            }
        };

        $scope.goToRestaurantPage = function (r) {
            var rest = window.location.href.replace("home", "myrestaurant");
            rest = replaceUrlParam(rest, "resN", r);
            window.location.href = rest;
            $rootScope.currentActiveMenu = "myrestaurant";
            $rootScope.currentMobileActiveMenu = "myrestaurant";
        };

        $scope.flipCard = function (e) {
            var card = $(e.currentTarget).parent();
            card.toggleClass('is-flipped');
            setTimeout(function () {
                card.find(".card__rate").toggleClass("card__hide_element");
                if (card.hasClass("is-flipped")) {
                    card.find(".card__bottom").css("transform", "rotateY(180deg)");
                    card.find(".card__info").css("display", "none");
                    card.find(".card__detail").css("display", "none");
                    card.find(".card__close").css("display", "block");
                } else {
                    card.find(".card__bottom").css("transform", "rotateY(0deg)");
                    card.find(".card__info").css("display", "block");
                    card.find(".card__detail").css("display", "block");
                    card.find(".card__close").css("display", "none");
                }
            }, 280);
        };
        $scope.showFoodDetail = function (food) {
            if (window.isMobile()) {
                $location.path('/emp-mobile-detail').search({id:food.id, d: $rootScope.dateToShowOnCards, t: $rootScope.timeToShowOnCards});
            } else {
                $scope.food = food;
                $scope.foodDetail();
                $scope.initOrderWithCount();
                $scope.open('app/pages/employee/home/detail.html', 'md');
                $scope.cleanComments();
                $scope.fetchComments();
                $scope.loadYourLastRateToThisFood();
            }
        };
        $scope.cardsBottomOrderFoodAction = function ($event, food) {
            if ($scope.wasClicked !== "middleCards") {
                $scope.initOrderWithCount();
                $scope.wasClicked = "middleCards"
            }
            // this has a bug : when a food is removed from left panel and again that food is ordered by the button at the bottom of card(this action), the count will be mistaken
            // var d = moment.utc($rootScope.dateToOrder);
            // var product = $rootScope.cartItems.get(d.format('YYYY-MM-DDTHH:mmZ') + food.id);
            // if (product) {
            //     if ($scope.lastElement && $scope.lastElement.attr("id") === product.attr("id")) {
            //         $scope.lastCount++;
            //         if ($scope.lastCount >= 2) {
            //             $uibModalStack.dismissAll();
            //             $scope.extraq = product.data("quantity");
            //             $scope.open('app/pages/employee/home/foodcounts.html', "sm");
            //             return;
            //         }
            //     } else {
            //         $scope.lastElement = product;
            //         $scope.lastCount = 0;
            //     }
            // }
            $scope.orderFood(food.id, $rootScope.dateToOrder.format('YYYY-MM-DDTHH:mmZ'), 1);
            if (!$rootScope.isMobile()) {
                $scope.addToTodayReserves(food.name, $rootScope.dateToOrder, food.id, Number(food.restaurant.id), food.foodType, food.restaurant.name, 1);
                var currentElem = $($event.currentTarget);
                var productCard = currentElem.parent();
                var floatImage = productCard.find(".card__image");
                var position = productCard.offset();

                $("body").append('<div class="floating-cart"></div>');
                var cart = $('div.floating-cart');
                floatImage.clone().appendTo(cart);
                $(cart).css({
                    'top': position.top + 'px',
                    "left": position.left + 'px'
                }).fadeIn("slow").addClass('moveToCart').css("top", (currentElem.offset().top - (currentElem.offset().top - $(".newsabad__text").offset().top)) + "px");
                setTimeout(function () {
                    $("body").addClass("MakeFloatingCart");
                }, 800);
                setTimeout(function () {
                    $('div.floating-cart').remove();
                    $("body").removeClass("MakeFloatingCart");
                    $scope.createOrderCart(food.name, $rootScope.dateToOrder.format('YYYY-MM-DDTHH:mmZ'), food.id, Number(food.restaurant.id), food.foodType, food.restaurant.name, true, 1);
                }, 1000);
                return false;
            }
        };
    }

    // check width for mobile
    checkWidth();
    window.onresize = function () {
        checkWidth();
    }

    function checkWidth() {
        if ((window.innerWidth > window.innerHeight - 50) && window.isMobile()) {
            console.log('ismobile');
        } else {
            console.log('no mobile');
        }
    }


})();

