/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages', [
        'ui.router',
        'ionic',
        'BlurAdmin.pages.dashboard',
        'BlurAdmin.pages.ui',
        'BlurAdmin.pages.components',
        'BlurAdmin.pages.form',
        'BlurAdmin.pages.tables',
        'BlurAdmin.pages.charts',
        'BlurAdmin.pages.maps',
        'BlurAdmin.pages.profile',
        'BlurAdmin.pages.home',
        'BlurAdmin.pages.myrestaurant',
        'BlurAdmin.pages.reserve',
        'BlurAdmin.pages.emp-mobile-detail',
        'BlurAdmin.pages.category',
        'BlurAdmin.pages.myfood',
        'BlurAdmin.pages.fooddetail',
        'BlurAdmin.pages.res-orders',
        'BlurAdmin.pages.total-res-orders',
        'BlurAdmin.pages.res-orders-details',
        'BlurAdmin.pages.invoice',
        'BlurAdmin.pages.restaurant-profile',
        'BlurAdmin.pages.company-active-users',
        'BlurAdmin.pages.company-inactive-users',
        'BlurAdmin.pages.company-charge-all',
        'BlurAdmin.pages.rest-detail',
        'BlurAdmin.pages.rest-list',
        'BlurAdmin.pages.co-detail',
        'BlurAdmin.pages.co-list',
        'BlurAdmin.pages.ad-co-users',
        'BlurAdmin.pages.ad-co-detail',
        'BlurAdmin.pages.ad-co-user-orders',
        'BlurAdmin.pages.ad-co-user-financial',
        'BlurAdmin.pages.ad-co-financial',
        'BlurAdmin.pages.ad-rest-financial',
        'BlurAdmin.pages.user-financial',
        'BlurAdmin.pages.co-financial',
        'BlurAdmin.pages.rest-financial',
        'BlurAdmin.pages.login',
        'BlurAdmin.pages.signup',
        'BlurAdmin.pages.comments',
        'BlurAdmin.pages.employee.transfer',
        'BlurAdmin.notification',
        'BlurAdmin.pages.company-profile',
        'BlurAdmin.pages.admin-invoice',
        'BlurAdmin.pages.rest-cheque',
        'BlurAdmin.pages.ad-rest-cheque-report',
        'BlurAdmin.pages.ad-cheques',
        'BlurAdmin.pages.my-ad-che',
        'BlurAdmin.pages.rest-cheque-report',
        'BlurAdmin.pages.co-employee-financial',
        'BlurAdmin.pages.rest-reports',
        'BlurAdmin.pages.co-reports',
        'BlurAdmin.pages.res-printed',
        'BlurAdmin.pages.donate',
        'BlurAdmin.pages.ad-charity',
        'BlurAdmin.pages.ad-charity-detail',
        'BlurAdmin.pages.list-charity',
        'BlurAdmin.pages.forget',
        'BlurAdmin.pages.changepass',
        'BlurAdmin.pages.holidays',
        'BlurAdmin.pages.charge-account',
        'BlurAdmin.pages.ad-reports',
        'BlurAdmin.pages.success-payment',
        'BlurAdmin.pages.failed-payment',
        'BlurAdmin.pages.feedgram-list',
        'BlurAdmin.pages.feedgram-detail',
        'BlurAdmin.pages.feedgram-co',
        'BlurAdmin.pages.feedgram-profile',
        'BlurAdmin.pages.feedgram-post',
        'BlurAdmin.pages.admin-food',
        'BlurAdmin.pages.admin-fooddetail',
        'BlurAdmin.pages.admin-orders',
        'BlurAdmin.pages.admin-order',
        'BlurAdmin.pages.ad-sms',
        'BlurAdmin.pages.emp-buy-report',
        'BlurAdmin.pages.emp-buy-report-detail',
        'BlurAdmin.pages.ad-loc',
        'BlurAdmin.pages.feedbacks'
    ])
        .run(runFirst).config(routeConfig)
        .directive("refreshTable", function () {
            return {
                require: 'stTable',
                restrict: "A",
                link: function (scope, elem, attr, table) {
                    scope.$on("refreshMyTable", function () {
                        table.tableState().pagination.start = 0;
                        table.pipe(table.tableState());
                    });
                }
            }
        })
        .directive("fader", function ($timeout, $ionicGesture, $ionicSideMenuDelegate) {
            return {
                restrict: 'E',
                require: '^ionSideMenus',
                scope: true,
                link: function ($scope, $element, $attr, sideMenuCtrl) {
                    $ionicGesture.on('tap', function (e) {
                        $ionicSideMenuDelegate.toggleLeft(true);
                    }, $element);
                    $ionicGesture.on('dragleft', function (e) {
                        sideMenuCtrl._handleDrag(e);
                        e.gesture.srcEvent.preventDefault();
                    }, $element);
                    $ionicGesture.on('dragright', function (e) {
                        sideMenuCtrl._handleDrag(e);
                        e.gesture.srcEvent.preventDefault();
                    }, $element);
                    $ionicGesture.on('release', function (e) {
                        sideMenuCtrl._endDrag(e);
                    }, $element);
                    $scope.sideMenuDelegate = $ionicSideMenuDelegate;
                    $scope.$watch('sideMenuDelegate.getOpenRatio()', function (ratio) {
                        if (Math.abs(ratio) < 1) {
                            $element[0].style.zIndex = "1";
                            $element[0].style.opacity = 0.7 - Math.abs(ratio);
                        } else {
                            $element[0].style.zIndex = "-1";
                        }
                    });
                }
            }
        })
        .directive('canDragMenu', function ($timeout, $ionicGesture, $ionicSideMenuDelegate) {
            if (window.isMobile()) {
                return {
                    restrict: 'A',
                    require: '^ionSideMenus',
                    scope: true,
                    link: function ($scope, $element, $attr, sideMenuCtrl) {
                        $ionicGesture.on('dragleft', function (e) {
                            sideMenuCtrl._handleDrag(e);
                            e.gesture.srcEvent.preventDefault();
                        }, $element);
                        $ionicGesture.on('dragright', function (e) {
                            sideMenuCtrl._handleDrag(e);
                            e.gesture.srcEvent.preventDefault();
                        }, $element);
                        $ionicGesture.on('release', function (e) {
                            sideMenuCtrl._endDrag(e);
                        }, $element);
                    }
                }
            }
        })
        .directive('commaseparator', function($filter) {
            'use strict';
            return {
                require: 'ngModel',
                link: function(scope, elem, attrs, ctrl) {
                    if (!ctrl) {
                        return;
                    }
                    ctrl.$formatters.unshift(function() {
                        return $filter('number')(ctrl.$modelValue);
                    });
                    ctrl.$parsers.unshift(function(viewValue) {
                        var plainNumber = viewValue.replace(/[\,\.\-\+]/g, ''),
                            b = $filter('number')(plainNumber);
                        elem.val(b);
                        return plainNumber;
                    });
                }
            };
        })
        .controller('MainCtrl', function ($scope, $window, $ionicSideMenuDelegate, $ionicGesture, $rootScope, $ionicHistory) {
            if (window.isMobile()) {
                // close menu in first loading
                ionic.Platform.ready(function () {
                    $ionicSideMenuDelegate.toggleLeft();
                });
                $scope.width = function () {
                    return $window.innerWidth;
                };

                $scope.openMenu = function () {
                    $ionicSideMenuDelegate.toggleLeft(true);
                };
                $scope.closeMenu = function () {
                    $ionicSideMenuDelegate.toggleLeft();
                };
                $scope.goBack = function () {
                    window.history.go(-1);
                    // $ionicHistory.goBack(-1);
                    // $ionicHistory.backView();
                };
                $rootScope.sortBox = function () {
                    var thisItem = $('.sort-btn');
                    var ionSideMenu = $(thisItem).closest('ion-side-menu');
                    if ($(ionSideMenu).find('[ui-view] .sort-box').hasClass('hidden-sort-box')) {
                        thisItem.closest('.search-bar-box').hide();
                        $(thisItem).find('path').addClass('mobile-menu-selected');
                        $rootScope.title = $rootScope.pageTitle;
                        $rootScope.pageTitle = 'مرتب سازی';
                        $(ionSideMenu).find('[ui-view] .sort-box').removeClass('hidden-sort-box').addClass('left-0-imp');
                        $(ionSideMenu).find('ion-content [ui-view]').addClass('ui-view-sort-visable');
                        $(ionSideMenu).find('ion-content [ui-view] .article-mobile-list').addClass('article-mobile-list-sort-visable');
                        $(ionSideMenu).find('ion-content').addClass('content-sort-visible');
                        $(ionSideMenu).find('ion-footer-bar').addClass('footer-sort-visible');
                    } else {
                        thisItem.closest('.search-bar-box').show(200);
                        $(thisItem).find('path').removeClass('mobile-menu-selected');
                        $rootScope.pageTitle = $rootScope.title;
                        $(ionSideMenu).find('[ui-view] .sort-box').addClass('hidden-sort-box').removeClass('left-0-imp');
                        window.setTimeout(function () {
                            $(ionSideMenu).find('ion-content [ui-view]').removeClass('ui-view-sort-visable');
                            $(ionSideMenu).find('ion-content [ui-view] .article-mobile-list').removeClass('article-mobile-list-sort-visable');
                            $(ionSideMenu).find('ion-content').removeClass('content-sort-visible');
                            $(ionSideMenu).find('ion-footer-bar').removeClass('footer-sort-visible');
                        }, 50);
                    }
                }

                //open menu 
                $scope.openMenu = function (e) {
                    $(e.currentTarget).closest('ion-side-menus').find('ion-side-menu-content').removeClass('hidden-first');
                    $(e.currentTarget).closest('ion-side-menus').find('fader').removeClass('hidden-first');
                }
            }
        });

    /** @ngInject */
    function runFirst($location, $rootScope, localStorageService, $http, toastrConfig, toastr, $uibModal, $ionicSideMenuDelegate) {
        $rootScope.myProfilePic = "assets/img/theme/no-photo.png";
        $rootScope.title = '';
        var url = $location.url();
        var token = localStorageService.get("my_access_token");
        $rootScope.roles = localStorageService.get("roles");
        $rootScope.username = localStorageService.get("username");

        $rootScope.hasRole = function (role) {
            return jQuery.inArray(role, $rootScope.roles) > -1;
        };
        $rootScope.loadMenus = function () {
            $rootScope.mainMenus = [];
            if ($rootScope.hasRole("RESTAURANT")) {
                $rootScope.mainMenus.push({
                    url: "rest-reports",
                    img: "assets/img/ui/menu/res-reports.png",
                    title: "گزارشها"
                }, {
                    url: "rest-cheque-report",
                    img: "assets/img/ui/menu/res-incomes.png",
                    title: "واریزی ها"
                }, {
                    url: "food",
                    img: "assets/img/ui/menu/res-menu.png",
                    title: "منو"
                }, {
                    url: "rest-financial",
                    img: "assets/img/ui/menu/res-finance.png",
                    title: "مالی"
                }, {
                    url: "total-res-orders",
                    img: "assets/img/ui/menu/res-total.png",
                    title: "تجمیعی"
                }, {
                    url: "res-orders",
                    img: "assets/img/ui/menu/res-orders.png",
                    title: "سفارشها"
                }, {
                    url: "res-printed",
                    img: "assets/img/ui/menu/res-printed.png",
                    title: "فاکتورهای چاپ شده"
                }, {
                    url: "invoice",
                    img: "assets/img/ui/menu/res-factors.png",
                    title: "فاکتورها"
                })
            }
            if ($rootScope.hasRole("COMPANY")) {
                $rootScope.mainMenus.push({
                    url: "co-reports",
                    img: "assets/img/ui/menu/co-reports.png",
                    title: "گزارشها"
                }, {
                    url: "app/pages/company/charge-all/charge.html",
                    img: "assets/img/ui/menu/co-chargeall.png",
                    title: "شارژ همه",
                    isModal: true
                }, {
                    url: "co-financial",
                    img: "assets/img/ui/menu/co-financial.png",
                    title: "مالی"
                }, {
                    url: "co-inactive-users",
                    img: "assets/img/ui/menu/inactive-users.png",
                    title: "کارمندان غیرفعال"
                }, {
                    url: "co-active-users",
                    img: "assets/img/ui/menu/active-users.png",
                    title: "کارمندان فعال"
                })
            }
            if ($rootScope.hasRole("ADMIN_EMPLOYEE")) {
                $rootScope.mainMenus.push({
                    url: "ad-co-users",
                    img: "assets/img/theme/icon/karafeedIcon/employee.png",
                    title: "کارمندان"
                })
            }
            if ($rootScope.hasRole("MASTER_ADMIN")) {
                $rootScope.mainMenus.push({
                    url: "comments",
                    img: "assets/img/theme/icon/karafeedIcon/comment.png",
                    title: "نظرات"
                }, {
                    url: "feedbacks",
                    img: "assets/img/theme/icon/karafeedIcon/comment.png",
                    title: "بازخورد مشتری"
                }, {
                    url: "holidays",
                    img: "assets/img/theme/icon/karafeedIcon/vacation.png",
                    title: "تعطیلات"
                }, {
                    url: "ad-reports",
                    img: "assets/img/theme/icon/karafeedIcon/report.png",
                    title: "گزارشها"
                }, {
                    url: "admin-cheque",
                    img: "assets/img/theme/icon/karafeedIcon/cheque.png",
                    title: "مالی کارافید"
                }, {
                    url: "ad-sms",
                    img: "assets/img/theme/icon/karafeedIcon/cheque.png",
                    title: "اس ام اس"
                })
            }
            if ($rootScope.hasRole("ADMIN_RESTAURANT")) {
                $rootScope.mainMenus.push({
                    url: "ad-invoice",
                    img: "assets/img/theme/icon/karafeedIcon/printInvoice.png",
                    title: "فاکتورهای صادرنشده"
                }, {
                    url: "ad-orders",
                    img: "assets/img/theme/icon/karafeedIcon/printInvoice.png",
                    title: "سفارشها"
                }, {
                    url: "rest-cheque",
                    img: "assets/img/theme/icon/karafeedIcon/cheque.png",
                    title: "مالی رستوران"
                }, {
                    url: "rest-list",
                    img: "assets/img/theme/icon/karafeedIcon/restaurant.png",
                    title: "رستوران ها"
                })
            }
            if ($rootScope.hasRole("ADMIN_COMPANY")) {
                $rootScope.mainMenus.push({
                    url: "co-list",
                    img: "assets/img/theme/icon/karafeedIcon/company.png",
                    title: "کمپانی ها"
                })
            }
            if ($rootScope.hasRole("EMPLOYEE")) {
                $rootScope.mainMenus.push({
                    url: "user-financial",
                    img: "assets/img/ui/menu/fin.png",
                    title: "مالی"
                }, {
                    url: "buy-report",
                    img: "assets/img/ui/menu/res-orders.png",
                    title: "سفارشها"
                }, {
                    url: "myrestaurant",
                    img: "assets/img/ui/menu/restaurant.png",
                    title: "رستوران"
                }, {
                    url: "home",
                    img: "assets/img/ui/menu/reserve.png",
                    title: "رزرو غذا"
                })
            }
        };
        $rootScope.loadMenus();

        $rootScope.loadBalanceByRole = function () {
            if (jQuery.inArray("EMPLOYEE", $rootScope.roles) > -1) {
                $rootScope.loadBalance("http://127.0.0.1:9000/v1/employee/getBalance", true);
            } else if (jQuery.inArray("COMPANY", $rootScope.roles) > -1 || jQuery.inArray("SILVER_COMPANY", $rootScope.roles) > -1) {
                $rootScope.loadBalance("http://127.0.0.1:9000/v1/company/getBalance");
            } else if (jQuery.inArray("RESTAURANT", $rootScope.roles) > -1) {
                $rootScope.loadBalance("http://127.0.0.1:9000/v1/restaurant/getLoginRestaurantBalance");
            } else {
                $rootScope.userBalance = 0;
            }
        };

        $rootScope.loadBalance = function (url, isEmployee) {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post(url, null, httpOptions)
                .success(function (data, status, headers, config) {
                    // console.log(data);
                    if (isEmployee) {
                        $rootScope.userBalance = data.availableBalanceAmount;
                    } else {
                        $rootScope.userBalance = data.balanceAmount;
                    }
                }).catch(function (err) {
                $rootScope.handleError(null, url, err, httpOptions);
            });
        };

        $rootScope.isMobile = function () { //تشخیص موبایل 
            return window.innerWidth <= 992;
        };
        $rootScope.locateFirstPage = function () {
            if (jQuery.inArray("EMPLOYEE", $rootScope.roles) > -1) {
                if ($rootScope.isMobile()) {
                    $location.path("/category");
                } else {
                    $location.path("/home");
                    $rootScope.currentActiveMenu = "home";
                }
            } else if (jQuery.inArray("RESTAURANT", $rootScope.roles) > -1) {
                $location.path("/invoice");
                $rootScope.currentActiveMenu = "invoice";
            } else if (jQuery.inArray("COMPANY", $rootScope.roles) > -1 || jQuery.inArray("SILVER_COMPANY", $rootScope.roles) > -1) {
                $location.path("/co-active-users");
                $rootScope.currentActiveMenu = "co-active-users";
            } else if (jQuery.inArray("ADMIN_COMPANY", $rootScope.roles) > -1) {
                $location.path("/co-list");
            } else if (jQuery.inArray("ADMIN_RESTAURANT", $rootScope.roles) > -1) {
                $location.path("/rest-list");
            } else if (jQuery.inArray("ADMIN_EMPLOYEE", $rootScope.roles) > -1) {
                $location.path("/ad-co-users");
            } else if (jQuery.inArray("MASTER_ADMIN", $rootScope.roles) > -1) {
                $location.path("/comments");
            } else if (jQuery.inArray("CHARITY", $rootScope.roles) > -1) {
                $location.path("/list-charity");
            } else {
                $location.path("/");
            }
        };

        $rootScope.loadProfileImage = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/general/getProfileImage", null, httpOptions)
                .then(function (data, status, headers, config) {
                    $rootScope.myProfilePic = data.data;
                    // console.log(data);
                    if ($rootScope.myProfilePic === "assets/img/defaults/default-employee.png" && $rootScope.hasRole("EMPLOYEE")) {
                        $rootScope.myProfilePic = "assets/img/defaults/default-menu.png";
                    }
                    if ($rootScope.myProfilePic === "assets/img/defaults/default-company.png" && ($rootScope.hasRole("COMPANY") || $rootScope.hasRole("SILVER_COMPANY"))) {
                        $rootScope.myProfilePic = "assets/img/defaults/default-menu.png";
                    }
                }).catch(function (err) {
            });
        };
        if (!token || !$rootScope.roles) {
            if (location.hash !== '#/forget')
                $location.path('/login');
        } else {
            $rootScope.loadBalanceByRole();
            $rootScope.loadProfileImage();
            if (!url) {
                $location.path($rootScope.locateFirstPage($rootScope.roles));
            } else {
                var p = location.hash.indexOf("?");
                if (p >= 0) {
                    $rootScope.currentActiveMenu = location.hash.substring(location.hash.indexOf("/") + 1, p);
                } else {
                    $rootScope.currentActiveMenu = location.hash.substring(location.hash.indexOf("/") + 1);
                }
            }
        }

        $rootScope.logout = function () {
            localStorageService.clearAll();
            $rootScope.roles = [];
            $location.search({});
            $rootScope.employee_params = null;
            $location.path("/login");
        };


        $rootScope.profile = function () {
            if (jQuery.inArray("EMPLOYEE", $rootScope.roles) > -1) {
                $rootScope.openModal('app/pages/employee/profile/profile.html', 'lg');
            } else if (jQuery.inArray("RESTAURANT", $rootScope.roles) > -1) {
                $rootScope.openModal('app/pages/restaurant/profile/res-profile.html', 'lg');
            } else if (jQuery.inArray("COMPANY", $rootScope.roles) > -1) {
                $rootScope.openModal('app/pages/company/profile/co-profile.html', 'lg');
            }
        };
        //vahid seraj updated code (1397/10/05)
        $rootScope.chargeAccount = function () { // باز کردن مودال برای افزودن اعتبار کاربران
            $rootScope.openModal('app/pages/charge-account/charge-account.html', 'md');
        };
        $rootScope.notifications = {
            count: 0
        };
        $rootScope.myFormatDate = function (d) {
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            return moment.utc(d).format('LLLL');
        };
        $rootScope.subtranctMinutes = function (d, m) {
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            return moment.utc(d).subtract("minutes", m).format('LLLL');
        };
        $rootScope.newNotifications = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "direction": "DESC",
                "page": 0,
                "size": 5,
                "sortBy": "date"
            };
            $http.post("http://127.0.0.1:9000/v1/message/getNewMessages", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.notifications = data.data;
                }).catch(function (err) {
                $rootScope.handleError(param, "/message/getNewMessages", err, httpOptions);
            });
        };

        $rootScope.inputIsInvalid = function (inputIsValid, inputId) {
            if (inputIsValid) {
                $("#" + inputId).parent().removeClass("has-error");
                return false;
            } else {
                if (!$("#" + inputId).parent().hasClass("has-error"))
                    $("#" + inputId).parent().addClass("has-error");
                return true;
            }
        };

        $rootScope.foodsTutorial = function () {
            $('body').pagewalkthrough({
                name: 'introduction',
                steps: [{
                    popup: {
                        content: 'به کارافید خوش آمدید',
                        type: 'modal'
                    }
                }, {
                    wrapper: '.slimScrollDiv',
                    popup: {
                        content: 'قسمت جستجوی غذا در کارافید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#date-search',
                    popup: {
                        content: 'تاریخ عرضه غذاها را از اینجا انتخاب کنید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#time-search',
                    popup: {
                        content: 'ساعت عرضه غذاها را از اینجا انتخاب کنید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#rest-search',
                    popup: {
                        content: 'غذاهای یک رستوران را از اینجا انتخاب کنید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#food-search',
                    popup: {
                        content: 'با نام و نوع غذا جستجو کنید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#sabad-side',
                    popup: {
                        content: 'در اینجا می توانید امور مربوط یه خریدهای خود را مدیریت کنید',
                        type: 'tooltip',
                        position: 'right'
                    }
                }, {
                    wrapper: '#sabad-detail',
                    popup: {
                        content: 'در اینجا می توانید تعداد, مجموع و جزییات خریدهای خود را مشاهده نمایید',
                        type: 'tooltip',
                        position: 'right'
                    }
                }, {
                    wrapper: '#wrapper-panel',
                    popup: {
                        content: 'در این قسمت می توانید دسرها و نوشیدنیهای مرتبط با رستورانی که غذا را از آن رزرو کردید مشاهده کنید و یا انتخابهای خود را کم و زیاد و یا حذف نمایید',
                        type: 'tooltip',
                        position: 'right'
                    }
                }, {
                    wrapper: '#article-list-main',
                    popup: {
                        content: 'در اینجا غذاهای مختلف را مشاهده می کنید که با رفتن روی هرکدام می توانید دکمه های رزرو, مواد اولیه ی آن غذا و مشاهده جزییات رستوران عرضه کننده آن غذا را مشاهده کنید',
                        type: 'tooltip',
                        position: 'top'
                    }
                }, {
                    wrapper: '.al-user-profile',
                    popup: {
                        content: 'در اینجا می توانید امکاناتی همچون ویرایش پروفایل, انتقال موجودی به همکار و آموزش صفحه ای که در آن هستید را داشته باشید',
                        type: 'tooltip',
                        position: 'left',
                        offsetVertical: 50
                    }
                }]
            });
            $('body').pagewalkthrough('show');
        };

        $rootScope.restTutorial = function () {
            $('body').pagewalkthrough({
                name: 'introduction',
                steps: [{
                    popup: {
                        content: 'در این صفحه رستوران های ثبت شده در کارافید را مشاهده می کنید',
                        type: 'modal'
                    }
                }, {
                    wrapper: '#rest-name-search',
                    popup: {
                        content: 'در اینجا می توانید با نام رستوران جستجو کنید',
                        type: 'tooltip',
                        position: 'left'
                    }
                }, {
                    wrapper: '#article-list-main',
                    popup: {
                        content: 'در اینجا رستوران های مختلف را مشاهده می کنید که با رفتن روی هرکدام دکمه منوی رستوران را مشاهده می کنید که با کلیک روی آن به صفحه غذاهای این رستوران منتقل می شوید. همچنین لینک مشاهده جزییات رستوران نمایان می شود که با کلیک بر آن اطلاعات رستوران نمایان می شود',
                        type: 'tooltip',
                        position: 'top',
                        offsetVertical: 80
                    }
                }]
            });
            $('body').pagewalkthrough('show');
        };

        $rootScope.financialTutorial = function () {
            $('body').pagewalkthrough({
                name: 'introduction',
                steps: [{
                    popup: {
                        content: 'در این صفحه می توانید گزارش تراکنش های مالی خود را با جستجوی تاریخ مشاهده کنید',
                        type: 'modal'
                    }
                }]
            });
            $('body').pagewalkthrough('show');
        };

        $rootScope.donateTutorial = function () {
            $('body').pagewalkthrough({
                name: 'introduction',
                steps: [{
                    popup: {
                        content: 'در این صفحه می توانید یک یا چند غذا در روز جاری را به خیریه ها اهدا کنید. با کلیک روی دکمه اهدا می کنم یکی از خیریه ها در همان روز به محل شما مراجعه کرده و غذا(های) شما را تحویل می گیرد',
                        type: 'modal'
                    }
                }]
            });
            $('body').pagewalkthrough('show');
        };

        $rootScope.tutorial = function () {
            if ($location.path() === '/home') {
                $rootScope.foodsTutorial();
            } else if ($location.path() === '/myrestaurant') {
                $rootScope.restTutorial();
            } else if ($location.path() === '/user-financial') {
                $rootScope.financialTutorial();
            } else {
                $rootScope.donateTutorial();
            }
        };

        $rootScope.checkFieldsEquality = function (id1, id2) {
            if ($("#" + id1).val() === $("#" + id2).val()) {
                $("#twofieldsareequal").css("display", "none");
                return true;
            } else {
                $("#twofieldsareequal").css("display", "block");
                setTimeout(function () {
                    $("#twofieldsareequal").css("display", "none");
                }, 5000);
                return false;
            }
        };
        var english = /^[A-Za-z0-9]*$/;
        $rootScope.isEnglish = function (t) {
            return english.test(t.charAt(0));
        };
        $rootScope.handleError = function (requestParams, url, err, h) {
            stopLoading();
            if (err.status === 401) {
                $rootScope.logout();
                return;
            }
            if (!err.data)
                return;
            if ($rootScope.isEnglish(err.data.message)) {
                showMessage(toastrConfig, toastr, "خطا", "خطای سیستمی", "error");
                var r = JSON.stringify(requestParams);
                var p = {
                    requestParam: r.toString().length >= 255 ? r.toString().substring(0, 255) : r.toString(),
                    serviceAddress: url,
                    exceptionMessage: err.data.message.toString().length >= 255 ? err.data.message.toString().substring(0, 255) : err.data.message.toString()
                };
                $http.post("http://127.0.0.1:9000/v1/log/insert", p, h)
                    .then(function (data, status, headers, config) {
                    }).catch(function (err) {
                });
            } else {
                showMessage(toastrConfig, toastr, "خطا", err.data.message, "error");
            }
        };
        $rootScope.openModal = function (page, size) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size
            });
        };
        $rootScope.menuClicked = function (m, isModal) {
            if (isModal) {
                $rootScope.openModal(m, 'md')
            } else {
                $rootScope.currentActiveMenu = m;
            }
        };
        $rootScope.mobileMenuClicked = function (e) {
            // var item = $('.mobile-menu-selected');
            // $(item[0]).removeClass('mobile-menu-selected');
            // var thisItem = $(e.currentTarget).find('path');
            // $(thisItem[0]).addClass('mobile-menu-selected');
        };
        $rootScope.formatPrice = function (p) {
            if (p) {
                p = p.toString();
                return p.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            }
            return 0;
        };
        $rootScope.getTransactionType = function (type) {
            switch (type) {
                case 'BUY_FOOD':
                    return "خرید غذا";
                case 'DELIVERY':
                    return "هزینه ارسال";
                case 'CHARGE_USER_BY_COMPANY':
                    return "افزایش اعتبار توسط شرکت";
                case 'GIFT':
                    return "هدیه";
                case 'LOTTERY':
                    return "قرعه کشی";
                case 'RESTAURANT_CANCEL_PENALTY':
                    return "جریمه کنسل شدن غذا توسط رستوران";
                case 'TRANSFER_TO_COWORKER':
                    return "انتقال به همکار";
                case 'BANK_TRANSFER':
                    return "واریز بانکی";
                case 'PAY_TO_RESTAURANT':
                    return "پرداخت به رستوران";
                case 'CHARGE_BY_ADMIN':
                    return "افزایش اعتبار توسط راهبر سیستم";
                case 'PENALTY_FOR_RESTAURANT_MISTAKE':
                    return "جریمه اشتباه رستوران";
                case 'CHEQUE_FOR_RESTAURANT':
                    return "صدور چک برای رستوران";
                case 'CHEQUE_FOR_ADMIN':
                    return "صدور چک درامد سیستم";
                case 'CHEQUE_FOR_TAX':
                    return "صدور چک ارزش افزورده";
                case 'SETTLEMENT':
                    return "تسویه";
                case 'INCREASE_GIFT_BUDGET':
                    return "افزایش بودجه پرداخت هدیه";
                case 'INCREASE_GIFT_WALLET_BY_COMPANY':
                    return "پراخت هدیه تشویقی به کارمندان";
                case 'BUY_FROM_GIFT_WALLET':
                    return "انتقال موجودی هدایا برای تسویه خرید";
                case 'INCREASE_GIFT_WALLET_BY_MANAGER':
                    return "دریافت هدیه تشویقی از مدیر";
                case 'RECEIVE_GIFT_WALLET_FROM_COMPANY':
                    return "دریافت هدیه تشویقی از شرکت";
                case 'BANK_TRANSFER_TO_GIFT_WALLET':
                    return "شارژ موجودی هدیه";
                case 'KARAFEED_TRADE':
                    return "معاملات کارافید";
                case 'SELL_TO_KARAFEED':
                    return "فروش به کارافید";
                case 'BUY_FROM_KARAFEED':
                    return "خرید از کارافید";
            }
        };
        $rootScope.getFoodOrderStatus = function (status) {
            switch (status) {
                case 'NORMAL':
                    return "نرمال";
                case 'FACTOR':
                    return "فاکتورشده";
                case 'CHARGE_USER_BY_COMPANY':
                    return "کنسل بوسیله رستوران";
                case 'PAYED_TO_RESTAURANT':
                    return "پرداخت شده به رستوران";
                case 'RESTAURANT_MISTAKE':
                    return "لغو:اشتباه رستوران";
                case 'SYSTEM_ERROR':
                    return "لغو:اشتباه سیستم";
                case 'OTHER':
                    return "لغو:سایر";
            }
        };
        $rootScope.restaurantTypes = [{
            label: "ایرانی",
            value: "IRANIAN"
        }, {
            label: "فرنگی",
            value: "FOREIGN"
        }, {
            label: "فست فود",
            value: "FASTFOOD"
        }, {
            label: "رژیمی",
            value: "DIET"
        }, {
            label: "دریای",
            value: "SEA"
        }];
        $rootScope.getRestaurantTypeByNames = function (n) {
            var types = [];
            if (!n)
                return;
            n = n.split(",");
            $.each($rootScope.restaurantTypes, function (i, v) {
                $.each(n, function (j, k) {
                    if (v.value === k)
                        types.push(v);
                })
            });
            return types;
        };
        $rootScope.scrollIsAtEnd = function (e) {
            return e.scrollTop() + e.height() >= e.prop('scrollHeight') - 5;
        };
        $rootScope.isValid = function (str) {
            return !/[~`!\s#$%\^&*()+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
        };

        //// for ionic nav        
        $rootScope.canRender = function (item) {
            if (window.location.hash == "#/profile" && (!item || item == 'search-bar')) {
                return false;
            } else if ((window.location.hash == "#/category" || window.location.hash == "#/detail" || window.location.hash == "#/reserve") && item == 'search-bar') {
                return false;
            } else if (window.location.hash == "#/category" && item == 'sort-btn') {
                return false;
            } else if (window.location.hash == "#/profile" && (item == 'header' || item == 'fader' || item == 'menu')) {
                return true;
            } else if (window.location.hash == "#/login") {
                return false;
            } else {
                return true;
            }
        };
        $rootScope.showFeedgramTab = function () {
            return $rootScope.currentMobileActiveMenu && $rootScope.currentMobileActiveMenu.includes("feedgram");
        };

        $rootScope.isKarafeedRestaurant = function (level) {
            return level && level.toLowerCase().indexOf("karafeed") >= 0;
        };

        $rootScope.foodIsAvailable = function(finishDate) {
            var now = moment.utc();
            now.add('hours',4);
            now.add('minutes',30);
            return !finishDate || now.isAfter(moment.utc(finishDate).format());
        };

    }

    function routeConfig($urlRouterProvider, baSidebarServiceProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.forwardCache(true);
        if (!ionic.Platform.isIOS()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }
        baSidebarServiceProvider.addStaticItem({
            title: 'Pages',
            icon: 'ion-document',
            subMenu: [{
                title: 'Sign In',
                fixedHref: 'auth.html',
                blank: true
            }]
        });
    }

})();
// for app
window.isMobile = function () { //تشخیص موبایل 
    return window.innerWidth <= 992;
};
