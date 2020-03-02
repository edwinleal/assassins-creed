var regApi = {
    enterEmail: function (email) {
        var promise = $.Deferred();
        if (!email || !$("#step-1Email").valid())
            promise.reject(false);
        else
            $.get("/api/sweepstakes/GetUserId", { email: email }, function (data) {
                if (data.id !== '') {
                    sessionStorage.setItem("plUserId", data.id);
                    sessionStorage.setItem("plUserGuid", data.userGuid);
                    $("#btnTWShare").attr('href', $("#btnTWShare").attr('href') + encodeURIComponent(data.userGuid));
                    promise.resolve(data);
                } else {
                    promise.reject(true);
                }
            });
        return promise;
    },
    
    getCaptcha: function () {
        var promise = $.Deferred();
        $.get("/api/sweepstakes/GetNewCaptcha", {}, function (data) { promise.resolve(data); });
        return promise;
    },
    
    reloadCaptcha: function () {
        $.when(regApi.getCaptcha()).then(function (data){
            $("#sr-captchaImg").attr("src", data.imagePath);
            $("#sr-captchaKey").val(data.key);
            $("#sr-captchaAudio").attr("src", data.audioPath);
        });
    },
    
    submitRegistration: function () {
        var promise = $.Deferred();
        
        var postInput = {
            userId: sessionStorage.getItem("plUserId"),
            userInfo: {
                FirstName: $("#sr-firstName").val(),
                LastName: $("#sr-lastName").val(),
                KitId: $("#sr-kitNum").val(),
                AgreeToRules: $("#sr-rulesAgree").prop("checked"),
                OptIn: $("#sr-emailOptIn").prop("checked"),
                Phone: $("#sr-phone").val(),
                Birthdate: $("#sr-birthMonth").val() + "/" + $("#sr-birthDay").val() + "/" + $("#sr-birthYear").val(),
                Address: {
                    Address1: $("#sr-address").val(),
                    City: $("#sr-city").val(),
                    State: $("#sr-state").val(),
                    PostalCode: $("#sr-zip").val()
                },
                Captcha: {
                    Key: $("#sr-captchaKey").val(),
                    Value: $("#sr-captchaValue").val()
                }
            }
        };
        
        if (sessionStorage.getItem('rfid')) {
            postInput.userInfo.ReferringUserGuid = sessionStorage.getItem('rfid');
            postInput.userInfo.ReferringSource = sessionStorage.getItem('rfsrc');
        }
        
        $.post("/api/sweepstakes/SubmitRegistration/", postInput, function (response) { 
			//console.log(response);
            if (response.success)
                promise.resolve(); 
            else 
                promise.reject(response.message || "There was an error with the registration, please check all input and try again later.");
        }).fail(function (jqXHR) {promise.reject(jqXHR.responseText);});
        
        return promise;
    }

};