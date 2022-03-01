// https://codeforgeek.com/google-recaptcha-v3-tutorial/
// https://iuliacazan.ro/how-to-integrate-google-recaptcha-v3-in-forms-that-use-ajax-validation/

$('document').ready(function() {
    // valid email pattern
    var eregex = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    jQuery.validator.addMethod("validemail", function(value, element) {
	// allow any non-whitespace characters as the host part
	return this.optional( element ) || eregex.test( value );
	});

    $("#login-form").validate({
        rules: {
            email: {
                required: true,
                validemail: true
            },
            pwd: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Informe seu e-mail!",
                validemail: "Informe um e-mail valido!"
            },
            pwd: {
                required: "Informe sua senha!"
            }
        },
        errorPlacement: function(error, element) {
            $(element).closest('.form-group').find('.help-block').html(error.html());
        },
        highlight: function(element) {
            $(element).closest('.form-control').removeClass('is-valid').addClass('is-invalid');
            $(element).closest('.custom-select').removeClass('is-valid').addClass('is-invalid');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.form-group').find('.help-block').html('');
            $(element).closest('.form-control').removeClass('is-invalid').addClass('is-valid');
            $(element).closest('.custom-select').removeClass('is-invalid').addClass('is-valid');
        },
        submitHandler: function() {
        	event.preventDefault();
                var data = $("#login-form").serialize();
                $.ajax({
                    type: 'POST',
                    url: '../../login/login.php',
                    data: data,
                    dataType: 'json',
                    beforeSend: function() {
                        $("#send_form").html('<i class="fas fa-spinner fa-spin"></i> Logando ...');
                    },
                    success: function(response) {
            			console.log(response);
                        if (response.result === true) {
                            $("#send_form").html('Logar');
                            $("#login-alert").css('display', 'none');
                            window.location.href = "../home/";
                        } else {
                            $("#send_form").html('Logar');
                            console.log('Menssagem: '+response.mensagem);
                            $("#mensagem").html('<center>' +
                                '<div class="panel-body padding-top-md" >' +
                                '<div id="login-alert" class="alert alert-' + response.alerta + ' col-sm-6">' +
                                response.iconem + '&#32;' + response.mensagem +
                                '</div>' +
                                '</div>' +
                                '</center>');
                            $("#login-alert").css('display', 'block');
                            window.scrollTo(0, 0);
                        }
                    },
				    error: function(XMLHttpRequest, textStatus, errorThrown) { 
                  $("#send_form").html('Logar');
                    $("#mensagem").html('<center>' +
                        '<div class="panel-body padding-top-md" >' +
                        '<div id="login-alert" class="alert alert-danger col-sm-6">' +
                        '<i class="fas fa-times"></i>&#32;Error: ' + errorThrown + ', Status: '+ textStatus +
                        '</div>' +
                        '</div>' +
                        '</center>');
                    $("#login-alert").css('display', 'block');
                    window.scrollTo(0, 0);
				    }
                }).fail(function (jqXHR, textStatus, error) {
                  $("#send_form").html('Logar');
                    $("#mensagem").html('<center>' +
                        '<div class="panel-body padding-top-md" >' +
                        '<div id="login-alert" class="alert alert-danger col-sm-6">' +
                        '<i class="fas fa-times"></i>&#32;Fail: ' + jqXHR.responseText +
                        '</div>' +
                        '</div>' +
                        '</center>');
                    $("#login-alert").css('display', 'block');
                    window.scrollTo(0, 0);
				});
        }
    });

});