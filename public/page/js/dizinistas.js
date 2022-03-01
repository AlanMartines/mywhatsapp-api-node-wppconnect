// https://codeforgeek.com/google-recaptcha-v3-tutorial/
// https://iuliacazan.ro/how-to-integrate-google-recaptcha-v3-in-forms-that-use-ajax-validation/

$('document').ready(function() {
    // valid email pattern
	jQuery.validator.addMethod("fullname", function(value, element) {
	  if (/^([a-zA-Z]{2,}\s[a-zA-z]{1,}'?-?[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?)/.test(value)) {
	    return true;
	  } else {
	    return false;
	  }
	}, 'Por favor, Informe o nome completo.');
	//
	jQuery.validator.addMethod("cep", function(value, element) {
	  return this.optional(element) || /^[0-9]{5}-[0-9]{3}$/.test(value);
	}, "Digite um CEP válido");
  //
  jQuery.validator.addMethod('numtel', function(telefone, element) {
    //retira todos os caracteres menos os numeros
    telefone = telefone.replace(/\D/g, '');

    //verifica se tem a qtde de numero correto
    if (!(telefone.length >= 10 && telefone.length <= 11)) return false;

    //Se tiver 11 caracteres, verificar se começa com 9 o celular
    if (telefone.length == 11 && parseInt(telefone.substring(2, 3)) != 9) return false;

    //verifica se não é nenhum numero digitado errado (propositalmente)
    for (var n = 0; n < 10; n++) {
      //um for de 0 a 9.
      //estou utilizando o metodo Array(q+1).join(n) onde "q" é a quantidade e n é o
      //caractere a ser repetido
      if (telefone == new Array(11).join(n) || telefone == new Array(12).join(n)) return false;
    }
    //DDDs validos
    var codigosDDD = [11, 12, 13, 14, 15, 16, 17, 18, 19,
      21, 22, 24, 27, 28, 31, 32, 33, 34,
      35, 37, 38, 41, 42, 43, 44, 45, 46,
      47, 48, 49, 51, 53, 54, 55, 61, 62,
      64, 63, 65, 66, 67, 68, 69, 71, 73,
      74, 75, 77, 79, 81, 82, 83, 84, 85,
      86, 87, 88, 89, 91, 92, 93, 94, 95,
      96, 97, 98, 99
    ];
    //verifica se o DDD é valido (sim, da pra verificar rsrsrs)
    if (codigosDDD.indexOf(parseInt(telefone.substring(0, 2))) == -1) return false;
    //
    //  E por ultimo verificar se o numero é realmente válido. Até 2016 um celular pode
    //ter 8 caracteres, após isso somente numeros de telefone e radios (ex. Nextel)
    //vão poder ter numeros de 8 digitos (fora o DDD), então esta função ficará inativa
    //até o fim de 2016, e se a ANATEL realmente cumprir o combinado, os numeros serão
    //validados corretamente após esse período.
    //NÃO ADICIONEI A VALIDAÇÂO DE QUAIS ESTADOS TEM NONO DIGITO, PQ DEPOIS DE 2016 ISSO NÃO FARÁ DIFERENÇA
    //Não se preocupe, o código irá ativar e desativar esta opção automaticamente.
    //Caso queira, em 2017, é só tirar o if.
    if (new Date().getFullYear() < 2017) return true;
    if (telefone.length == 10 && [2, 3, 4, 5, 7].indexOf(parseInt(telefone.substring(2, 3))) == -1) return false;

    //se passar por todas as validações acima, então está tudo certo
    return true;
  }, 'Informe um número de telefone celular válido!');
  //
    $("#dizinistas-form").validate({
        rules: {
            codigo_igreja: {
                required: true
            },
			codigo_paroquia: {
                required: true
            },
            dizimista: {
                required: true,
                fullname: true
            },
            dn_dizimista: {
                required: true
            },
            conjuge: {
                required: false
            },
            dn_conjuge: {
                required: false
            },
            fone: {
                required: true,
                numtel: true
            },
            cep: {
                required: false
            },
            uf: {
                required: false
            },
            cidade: {
                required: false
            },
            rua: {
                required: false
            },
            numero: {
                required: false
            },
            bairro: {
                required: false
            },
            complemento: {
                required: false
            }
        },
        messages: {
            codigo_igreja: {
                required: "Informe o código da igreja."
            },
            codigo_paroquia: {
                required: "Informe o código da paróquia."
            },
            dizimista: {
                required: "Informe o nome completo.",
                fullname: "Informe o nome corretamente."
            },
			dn_dizimista: {
                required: "Informe a data de nasc."
            },
            conjuge: {
                required: "Informe o nome corretamente."
            },
            dn_conjuge: {
                required: "Informe a data de nasc."
            },
            fone: {
                required: "Informe o telefone.",
                numtel: "Informe um número de telefone válido."
            },
            cep: {
                required: "Informe o cep."
            },
            uf: {
                required: "Informe o estado."
            },
            cidade: {
                required: "Informe a cidade."
            },
            rua: {
                required: "Informe a rua."
            },
            numero: {
                required: "Informe o numero."
            },
            bairro: {
                required: "Informe o bairro."
            },
            complemento: {
                required: "Informe o complemento."
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
                        if (response.codigo == "1") {
                            $("#send_form").html('Logar');
                            $("#login-alert").css('display', 'none');
                            window.location.href = "../home/";
                        } else {
                            $("#send_form").html('Logar');
                            console.log('Menssagem: '+response.mensagem);
                            console.log('Debug: '+response.debug);
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
                    }
                });
        }
    });
  //
  //
  //-------------------------------------------------------------------------------------------------------------//
  //
  //
  $("#addusuarios-form").validate({
    ignore: ".ignore",
    rules: {
      nome: {
        required: true,
        validname: true,
        minlength: 4
      },
      cpfcnpj: {
	    required: true,
	    minlength: 11,
	    uniqueCPFCNPJ: true
	  },
	  rg: {
		required: false,
		minlength: 10,
		uniqueRG: true
	  },
	  org_emissor: {
		required: false
	  },
      cep: {
        required: true
      },
      uf: {
        required: true
      },
      cidade: {
        required: true
      },
      rua: {
        required: true
      },
      numero: {
        required: true
      },
      bairro: {
        required: true
      },
      email: {
        required: true,
        validemail: true,
        uniqueEMAIL: true
      },
      cemail: {
        required: true,
        validemail: true,
        equalTo: '#email'
      },
      senha: {
        required: true,
        minlength: 8,
        validpassword: true
      },
      csenha: {
        required: true,
        equalTo: '#senha'
      },
      celular: {
        required: true,
        numtel: true
      },
      perfil: {
        required: true
      },
      active: {
        required: true
      }
    },
    messages: {
      nome: {
        required: "Informe um nome.",
        validname: "O nome deve conter apenas letras e espaços.",
        minlength: "Nome informado é muito curto."
      },
      cpfcnpj: {
        required: "Informe o CPF/CNPJ.",
        minlength: "Deve conter pelo menos 11 digitos",
        verificaCPFCNPJ: "Informe um CPF/CNPJ válido.",
        uniqueCPFCNPJ: "CPF/CNPJ já está registrado."
      },
      rg: {
        required: "Informe o RG",
        minlength: "Deve conter pelo menos 10 digitos.",
        uniqueRG: "RG já está registrado."
      },
      org_emissor: {
        required: "Informe o Orgão Emissor."
      },
      cep: {
        required: "Informe o CEP."
      },
      uf: {
        required: "Informe o estado."
      },
      cidade: {
        required: "Informe a cidade."
      },
      rua: {
        required: "Informe o endereço."
      },
      numero: {
        required: "Informe o numero."
      },
      bairro: {
        required: "Informe o bairro."
      },
      email: {
        required: "Informe um endereço de e-mail.",
        validemail: "Informe um endereço de e-mail válido.",
        uniqueEMAIL: "E-mail já está registrado."
      },
      cemail: {
        required: "Por favor, confirme o endereço de e-mail.",
        equalTo: "O e-mail não corresponde!"
      },
      senha: {
        required: "Informe a senha.",
        minlength: "A senha tem pelo menos 8 caracteres.",
        validpassword: "Deve conter letras maiúsculas, minúsculas, números e caractere especial."
      },
      csenha: {
        required: "Por favor, confirme sua senha.",
        equalTo: "A senha não corresponde!"
      },
      celular: {
        required: "Informe numero de celular.",
        numtel: "Informe um número válido"
      },
      perfil: {
        required: "Selecione um perfil."
      },
      active: {
        required: "Selecione uma opção."
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
        url: '../usuarios/insert.php',
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
            if (response.codigo === false) {
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