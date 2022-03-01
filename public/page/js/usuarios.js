$('document').ready(function() {
    // valid email pattern
    var eregex = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

    jQuery.validator.addMethod("validemail", function(value, element) {
	// allow any non-whitespace characters as the host part
	return this.optional( element ) || eregex.test( value );
	});
  // name validation
  var nameregex = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;
  jQuery.validator.addMethod("validname", function(value, element) {
    return this.optional(element) || nameregex.test(value);
  });
  // valid password pattern
  var pwregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
  jQuery.validator.addMethod("validpassword", function(value, element) {
    return this.optional(element) || pwregex.test(value);
  },"Informe uma senha válida.");
  //
  jQuery.validator.addMethod("uniqueEMAIL", function(email, element) {
    var emailUrl = "../validate/check_email.php";
    //let result = false;
    $.ajax({
      type: "POST",
      url: emailUrl,
      data: {
        email: email
      },
      dataType: "JSON",
      dataFilter: function(data) {
        var json = JSON.parse(data);
        if (json.isError === false) {
          result = false;
        } else {
          result = true;
        }
      },
      async: false
    });
    return result;
  }, "E-MAIL já está registrado.");
  //
  $("#addusuarios-form").validate({
    rules: {
    codigo_igreja: {
        required: true
    },
      nome: {
	    required: true
	  },
      email: {
        required: true,
        validemail: true,
        uniqueEMAIL: true
      },
      perfil: {
        required: true
      },
     senha: {
        required: true,
        minlength: 8,
        validpassword: true
      },
      csenha: {
        required: true,
        equalTo: '#senha'
      }
    },
    messages: {
        codigo_igreja: {
            required: "Informe o código da igreja."
        },
      nome: {
        required: "Informe um nome.",
        validname: "O nome deve conter apenas letras e espaços.",
        minlength: "Nome informado é muito curto."
      },
      email: {
        required: "Informe um endereço de e-mail.",
        validemail: "Informe um endereço de e-mail válido.",
        uniqueEMAIL: "E-mail já está registrado."
      },
      perfil: {
        required: "Selecione um perfil."
      },
      senha: {
        required: "Informe a senha.",
        minlength: "A senha tem pelo menos 8 caracteres.",
        validpassword: "Deve conter letras maiúsculas, minúsculas, números e caractere especial."
      },
      csenha: {
        required: "Por favor, confirme sua senha.",
        equalTo: "A senha não corresponde!"
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
      //
      //event.preventDefault(e);
      var data = $("#addusuarios-form").serialize();
      $.ajax({
        type: 'POST',
        url: '../../usuarios/insert.php',
        data: data,
        dataType: 'json',
        beforeSend: function() {
          $("#send_form").html('<i class="fas fa-spinner fa-spin"></i> Cadastrando...');
        },
        success: function(response) {
          //var json = JSON.parse(response);
          //if (json.isError == false) {
          $("#send_form").html('Cadastrar');
          Lobibox.notify(response.alerta, {
            size: 'mini', // normal, mini, large
            soundPath: '../public/lobibox/sounds/', // The folder path where sounds are located
            soundExt: '.ogg', // Default extension for all sounds
            icon: true, // Icon of notification. Leave as is for default icon or set custom string
            delay: 5000, //In milliseconds
            position: 'bottom right', // Place to show notification. Available options: "top left", "top right", "bottom left", "bottom right"
            iconSource: "fontAwesome", // "bootstrap" or "fontAwesome" the library which will be used for icons
            title: response.title,
            msg: response.mensagem,
          });
          setTimeout(function() {
            if (response.result === false) {
              window.location.href = "index.php";
            }
          }, 3000);
        },
        error: function(xhr, textStatus, error) {
          $("#send_form").html('Cadastrar');
          Lobibox.notify('danger', {
            size: 'mini', // normal, mini, large
            soundPath: '../public/lobibox/sounds/', // The folder path where sounds are located
            soundExt: '.ogg', // Default extension for all sounds
            icon: true, // Icon of notification. Leave as is for default icon or set custom string
            delay: 3000, //In milliseconds
            position: 'bottom right', // Place to show notification. Available options: "top left", "top right", "bottom left", "bottom right"
            iconSource: "fontAwesome", // "bootstrap" or "fontAwesome" the library which will be used for icons
            title: 'Erro',
            msg: 'Erro ao adicionar registro',
          });
          setTimeout(function() {}, 3000);
          //window.location.href = "index.php";
        }
      }).fail(function(jqXHR, textStatus, msg) {
        $("#send_form").html('Cadastrar');
        Lobibox.notify('warning', {
          size: 'mini', // normal, mini, large
          soundPath: '../public/lobibox/sounds/', // The folder path where sounds are located
          soundExt: '.ogg', // Default extension for all sounds
          icon: true, // Icon of notification. Leave as is for default icon or set custom string
          delay: 3000, //In milliseconds
          position: 'bottom right', // Place to show notification. Available options: "top left", "top right", "bottom left", "bottom right"
          iconSource: "fontAwesome", // "bootstrap" or "fontAwesome" the library which will be used for icons
          title: "Atenção",
          msg: 'Erro interno, contate o administrador do sistema',
        });
        setTimeout(function() {}, 3000);
        //window.location.href = "index.php";
      });
      //  
    }
  });
  //
  //
  //-------------------------------------------------------------------------------------------------------------//
  //
  //
});