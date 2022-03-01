$(document).ready(function() {
  //var clipboard = new ClipboardJS('.clipboard');

  // Tooltip

  $('button').tooltip({
    trigger: 'click',
    placement: 'bottom'
  });
  //
  function setTooltip(btn, message) {
    $(btn).tooltip('hide')
      .attr('data-original-title', message)
      .tooltip('show');
  }

  function hideTooltip(btn) {
    setTimeout(function() {
      $(btn).tooltip('hide');
    }, 1000);
  }
  //
  var clipboard = new ClipboardJS('.clipboard');
  //
  clipboard.on('success', function(e) {
    e.clearSelection();
    setTooltip(e.trigger, 'Copiado!');
    hideTooltip(e.trigger);
  });
  //
  clipboard.on('error', function(e) {
    e.clearSelection();
    setTooltip(e.trigger, 'Erro ao copiar!');
    hideTooltip(e.trigger);
  });
  //
  $('.pr-password').strengthMeter('tooltip', {
    hierarchy: {
      '0': 'Informe uma senha',
      '25': 'Muito fraca',
      '50': 'Fraca',
      '75': 'Boa',
      '100': 'Forte',
      '125': 'Muito forte'
    },
    tooltip: {
      placement: 'bottom' //left or right or top or bottom
    },
    passwordScore: {
      options: [],
      append: true
    }
  });
	//
  $(".btn-pwd").on('click', function(event) {
    event.preventDefault();
    if ($('#show_pwd input').attr("type") == "text") {
      $('#show_pwd input').attr('type', 'password');
      $('#show_pwd i').addClass("fa-eye-slash");
      $('#show_pwd i').removeClass("fa-eye");
    } else if ($('#show_pwd input').attr("type") == "password") {
      $('#show_pwd input').attr('type', 'text');
      $('#show_pwd i').removeClass("fa-eye-slash");
      $('#show_pwd i').addClass("fa-eye");
    }
  });
  //
  $(".btn-old-password").on('click', function(event) {
    event.preventDefault();
    if ($('#old_show_password input').attr("type") == "text") {
      $('#old_show_password input').attr('type', 'password');
      $('#old_show_password i').addClass("fa-eye-slash");
      $('#old_show_password i').removeClass("fa-eye");
    } else if ($('#old_show_password input').attr("type") == "password") {
      $('#old_show_password input').attr('type', 'text');
      $('#old_show_password i').removeClass("fa-eye-slash");
      $('#old_show_password i').addClass("fa-eye");
    }
  });
  //
  $(".btn-password").on('click', function(event) {
    event.preventDefault();
    if ($('#show_password input').attr("type") == "text") {
      $('#show_password input').attr('type', 'password');
      $('#show_password i').addClass("fa-eye-slash");
      $('#show_password i').removeClass("fa-eye");
    } else if ($('#show_password input').attr("type") == "password") {
      $('#show_password input').attr('type', 'text');
      $('#show_password i').removeClass("fa-eye-slash");
      $('#show_password i').addClass("fa-eye");
    }
  });
  //
  $(".btn-cpassword").on('click', function(event) {
    event.preventDefault();
    if ($('#show_cpassword input').attr("type") == "text") {
      $('#show_cpassword input').attr('type', 'password');
      $('#show_cpassword i').addClass("fa-eye-slash");
      $('#show_cpassword i').removeClass("fa-eye");
    } else if ($('#show_cpassword input').attr("type") == "password") {
      $('#show_cpassword input').attr('type', 'text');
      $('#show_cpassword i').removeClass("fa-eye-slash");
      $('#show_cpassword i').addClass("fa-eye");
    }
  });
  //
  $(".pr-password").passwordRequirements({
    numCharacters: 8,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSpecial: true,
    infoMessage: 'A senha deve te no mínimo 8 caracteres, e deve conter pelo menos 1 letra minúscula, 1 letra maiúscula, 1 número e 1 caractere especial.',
    style: "dark", // Style Options light or dark
    fadeTime: 500 // FadeIn / FadeOut in milliseconds
  });
  //$('.pr-password').addClass('is-invalid');
  //
});