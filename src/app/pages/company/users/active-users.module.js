(function () {
    'use strict';

    angular.module('BlurAdmin.pages.company-active-users', [])
        .config(routeConfig)
        .controller('companyActiveUsersCtrl', companyActiveUsersCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-active-users', {
                url: '/co-active-users',
                templateUrl: 'app/pages/company/users/active-users.html',
                controller: 'companyActiveUsersCtrl'
            });
    }

    function companyActiveUsersCtrl($scope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr, $rootScope) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        $scope.chargeReason = "BIRTHDAY";
        $scope.employeeLevel = "EMPLOYEE";

        $scope.$on('$locationChangeStart', function () {
            if ($scope.onBrowserBackLeaveDetail) {
                $scope.showList();
                $location.search('emp',null);
                $scope.onBrowserBackLeaveDetail = false;
            }
            if ($location.search().emp === 'emp') {
                $scope.onBrowserBackLeaveDetail = true;
            }
        });

        $scope.initCtrl = function () {
            $scope.submitted = false;
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": 0,
                    "size": 50,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/getCompanyLocationsForEmployeeDefinition", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.locs = data.data;
                }).catch(function (err) {
            });
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
        $scope.search = function (pagination, sort, search) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            if ($rootScope.selectedEmpPageNum >= 0) {
                pagination.start = $rootScope.selectedEmpPageNum * pagination.number;
                $scope.employeeName = $rootScope.searchedEmployeeName;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                pageableDTO: {
                    direction: sort.reverse ? 'DESC' : 'ASC',
                    page: pagination.start / pagination.number,
                    size: pagination.number,
                    sortBy: sort.predicate ? sort.predicate : 'name'
                },
                name: $scope.employeeName,
                personnelCode: $scope.personnelCode,
                status: "ACTIVE"
            };
            $scope.pageNumber = param.pageableDTO.page;
            return $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/searchEmployee", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.companyUsers = data.data.list;
                    if ($rootScope.selectedEmpPageNum >= 0) {
                        for (var i = 0; i < $scope.companyUsers.length; i++) {
                            if ($scope.companyUsers[i].id === Number($rootScope.empId)) {
                                $scope.showDetail($scope.companyUsers[i], i);
                            }
                        }
                        $scope.onBrowserBackLeaveDetail = true;
                        $rootScope.selectedEmpPageNum = -1;
                    }
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/companyEmployeeManagement/searchEmployee", err, httpOptions);
                });
        };
        var delayTimer;
        var searchParam = {
            predicateObject: {
                name: null,
                personnelCode: null
            }
        };
        $scope.userSearch = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                $scope.$broadcast('refreshMyTable');
                $scope.showList();
            }, 1000);
        };
        $scope.openModal = function (page, size) {
            $scope.submitted = false;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.edit = function () {
            $scope.employeeActiveMenu = "edit";
            $scope.employeePopupTitle = "ویرایش اطلاعات کارمند";
            $scope.openModal('app/pages/company/users/detail.html', 'lg');
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/getEmployeeById", $rootScope.companyUserId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.userInfo = data.data;
                    if ($rootScope.userInfo.birthday) {
                        var defaultDate = moment.utc($rootScope.userInfo.birthday).format('jYYYY/jM/jD');
                        $('#birthdate').find('input').val(defaultDate);
                    }
                    drawMap();
                }).catch(function (err) {
                $rootScope.handleError($rootScope.companyUserId, "/companyEmployeeManagement/getEmployeeById", err, httpOptions);
            });
        };

        $scope.saveOrUpdateUser = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var bdate = $("#birthdate").find('input').val();
            $rootScope.userInfo.birthday = bdate ? moment.utc(bdate, 'jYYYY/jM/jD').format('YYYY-MM-DD') : null;
            $rootScope.userInfo.employeeLevel = $scope.employeeLevel;
            $rootScope.userInfo.personnelCode = $rootScope.userInfo.personnelCode ? $rootScope.userInfo.personnelCode : "";
            if (!$rootScope.userInfo.id) {
                $rootScope.userInfo.user = {
                    username: $("#username").val().toLowerCase(),
                    password: $("#pass").val()
                };
                if (!$rootScope.isValid($rootScope.userInfo.user.username)) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "خطا", "لطفا در فیلد نام کاربری از کاراکترهای مجاز استفاده کنید", "error");
                    return;
                }
                if (!$rootScope.userInfo.location.title) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "خطا", "لطفا محل کارمند را انتخاب کنید", "error");
                    return;
                }
                if (!$rootScope.userInfo.department) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "خطا", "لطفا دپارتمان را انتخاب کنید", "error");
                    return;
                }
            }
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/addOrUpdateEmployee", $rootScope.userInfo, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.userInfo = data.data;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError($rootScope.userInfo, "/companyEmployeeManagement/addOrUpdateEmployee", err, httpOptions);
            });
        };


        var marker;

        function drawMap() {
            setTimeout(function () {
                var mapCanvas = document.getElementById('map');
                var myLatLng;
                if ($rootScope.userInfo.location && $rootScope.userInfo.location.point) {
                    var latlng = $rootScope.userInfo.location.point.split(",");
                    myLatLng = {lat: Number(latlng[0]), lng: Number(latlng[1])};
                } else {
                    myLatLng = {lat: 35.747262, lng: 51.451300};
                }

                var mapOptions = {
                    center: new google.maps.LatLng(myLatLng),
                    zoom: 14,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(mapCanvas, mapOptions);
                marker = new google.maps.Marker({
                    position: myLatLng,
                    map: map
                });
            }, 1000);
        }

        $scope.employeeLevelChanged = function (t) {
            $scope.employeeLevel = t;
        };

        $scope.changePass = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $rootScope.companyUserId,
                password: $('#newPass').val()
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/resetEmployeePassword", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/companyEmployeeManagement/resetEmployeePassword", err, httpOptions);
            });
        };

        $scope.deactiveUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/deActiveEmployee", {id: $rootScope.companyUserId}, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.showList();
                    $uibModalStack.dismissAll();
                    $scope.companyUsers.splice($scope.companyUserIndex, 1);
                    if ($scope.companyUsers.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($rootScope.companyUserId, "/companyEmployeeManagement/deActiveEmployee", err, httpOptions);
            });
        };
        $scope.doCharge = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "comment": $('#cdesc').val(),
                "companyAccountId": $rootScope.companyUserId,
                "employeeAccountId": $rootScope.companyUserId,
                "transferAmount": $("#camount").val()
            };
            $http.post("http://127.0.0.1:9000/v1/company/chargeEmployee", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.loadBalanceByRole();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/company/chargeEmployee", err, httpOptions);
            });
        };
        $scope.takeBackChargesFromAllEmployee = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/company/takeBackChargesFromAllEmployee", null, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(null, "/company/takeBackChargesFromAllEmployee", err, httpOptions);
            });
        };
        $scope.uploadGiftImage = function () {
            var fileInput = document.getElementById('uploadFile');
            $(fileInput).off('change');
            $(fileInput).on('change', handleFiles);

            // fileInput.addEventListener("change", handleFiles, false);

            function handleFiles() {
                var img = new Image();
                var _URL = window.URL || window.webkitURL;
                var file = this.files[0];
                if (!file)
                    return;
                if (!file.type || $.inArray(file.type.substr(file.type.indexOf("/") + 1), ['png', 'jpg', 'jpeg']) === -1) {
                    showMessage(toastrConfig, toastr, "خطا", "لطفا فایل عکس آپلود کنید", "error");
                    return;
                }
                startLoading();
                img.onload = function () {
                    if (this.width > 1600) {
                        showMessage(toastrConfig, toastr, "خطا", "عرض عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    if (this.height > 1600) {
                        showMessage(toastrConfig, toastr, "خطا", "ارتفاع عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    canvasResize(file, {
                        crop: false,
                        quality: 80,
                        //rotate: 90,
                        callback: function (data, width, height) {
                            if ((4 * Math.ceil((data.length / 3)) * 0.5624896334383812) / 1000 > 600) {
                                showMessage(toastrConfig, toastr, "خطا", "حجم فایل زیاد است", "error");
                                stopLoading();
                                return;
                            }
                            setPicElements(data, data.substring(data.indexOf("/") + 1, data.indexOf(";")));
                            stopLoading();
                        }
                    });
                };
                img.src = _URL.createObjectURL(file);
            }

            fileInput.click();
        };

        function setPicElements(img, postfix) {
            $scope.giftImage = img;
            $scope.giftImagePostfix = postfix;
        }

        $scope.setAmountOfGift = function(a) {
            $scope.amount = a;
        };

        $scope.setDescOfGift = function(d) {
            $scope.desc = d;
        };

        $scope.doGift = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "giftImage": {
                    "image": $scope.giftImage ? $scope.giftImage.substring($scope.giftImage.indexOf(",") + 1) : null,
                    "postfix": $scope.giftImagePostfix
                },
                "comment": $("#desc").val(),
                "companyAccountId": $rootScope.companyUserId,
                "employeeAccountId": $rootScope.companyUserId,
                "transferAmount": $("#amount").val()
                // "giftTypeEnum": $scope.chargeReason
            };
            $http.post("http://127.0.0.1:9000/v1/company/giveGift", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.loadBalanceByRole();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/company/giveGift", err, httpOptions);
            });
        };

        $scope.finance = function (id) {
            $location.path('/co-employee-financial').search({id: id, p: $scope.pageNumber, n: $scope.employeeName});
        };

        $scope.addUsesr = function () {
            $scope.employeePopupTitle = "افزودن کارمند جدید";
            $scope.openModal('app/pages/company/users/detail.html', 'lg');
            $rootScope.userInfo = {
                name: null,
                personnelCode: null,
                location: {
                    point: null,
                    address: null
                }
            };
            drawMap();
        };

        $scope.colorizeBasedOnPage = function () {
            if (!$scope.isInList) {
                $(".modal-content").css("background", "#4b7db5");
            }
        };

        $scope.chargeReasonChanged = function (r) {
            $scope.chargeReason = r;
        };
        $scope.employeeActiveMenu = "gift";
        $scope.isInList = true;
        $scope.showDetail = function (item, index) {
            $scope.onBrowserBackLeaveDetail = false;
            $location.search("emp", "emp");
            $rootScope.companyUserId = item.id;
            $("#container").toggleClass("active-employees-background");
            $("#emp-table").fadeOut();
            $("#emp-detail").fadeIn();
            $scope.companyUserIndex = index;
            $(".mycontent").css("background", "white").css("height", "100%");
            $scope.isInList = false;
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": item.id
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/getEmployeeExtraData", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.employee = {
                        id: item.id,
                        general: item,
                        detail: data.data
                    };
                }).catch(function (err) {
                $rootScope.handleError(param, "/companyEmployeeManagement/getEmployeeExtraData", err, httpOptions);
            });
        };
        $scope.showList = function () {
            $scope.onBrowserBackLeaveDetail = false;
            $location.search("emp", null);
            $("#container").toggleClass("active-employees-background");
            $("#emp-detail").fadeOut();
            $("#emp-table").fadeIn();
            $(".mycontent").css("background", "#e2eded").css("height", "unset");
            $scope.isInList = true;
        };
        $scope.inactivate = function (id) {
            $scope.employeeActiveMenu = 'inactive';
            $scope.openModal('app/pages/company/users/deactive-modal.html', 'md', id);
        };
        $scope.charge = function (id) {
            $scope.submitted = false;
            $scope.employeeActiveMenu = 'charge';
        };
        $scope.gift = function (id) {
            $scope.submitted = false;
            $scope.employeeActiveMenu = 'gift';
        };

        $scope.address_changed = function (r) {
            $scope.userInfo.location = r;
            drawMap();
        };

        $scope.dept_changed = function (r) {
            $scope.userInfo.department = r;
        };

    }
})();
