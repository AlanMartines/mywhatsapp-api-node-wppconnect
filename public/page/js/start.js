// https://codeforgeek.com/google-recaptcha-v3-tutorial/
// https://iuliacazan.ro/how-to-integrate-google-recaptcha-v3-in-forms-that-use-ajax-validation/

$('document').ready(function() {
    // valid email pattern
    var eregex = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    jQuery.validator.addMethod("validemail", function(value, element) {
	// allow any non-whitespace characters as the host part
	return this.optional( element ) || eregex.test( value );
	});

    $("#start-form").validate({
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
					var data = $("#start-form").serialize();
					initSession(data);
        }
    });

});