$('document').ready(function () {

	$("#start-form").validate({
		rules: {
			AuthorizationToken: {
				required: true
			},
			SessionName: {
				required: true
			},
			MultiDevice: {
				required: true
			},
			whatsappVersion: {
				required: false
			}
		},
		messages: {
			AuthorizationToken: {
				required: "Por favor, Informe seu token."
			},
			SessionName: {
				required: "Por favor, Informe o nome da sessão."
			},
			MultiDevice: {
				required: "Por favor, Selecione uma opção."
			},
			whatsappVersion: {
				required: "Por favor, Informe uma versão."
			}
		},
		errorPlacement: function (error, element) {
			$(element).closest('.form-group').find('.help-block').html(error.html());
		},
		highlight: function (element) {
			$(element).closest('.form-control').removeClass('is-valid').addClass('is-invalid');
			$(element).closest('.custom-select').removeClass('is-valid').addClass('is-invalid');
		},
		unhighlight: function (element, errorClass, validClass) {
			$(element).closest('.form-group').find('.help-block').html('');
			$(element).closest('.form-control').removeClass('is-invalid').addClass('is-valid');
			$(element).closest('.custom-select').removeClass('is-invalid').addClass('is-valid');
		},
		submitHandler: function () {
			event.preventDefault();
			var data = $("#start-form").serialize();
			initSession(data);
		}
	});

});