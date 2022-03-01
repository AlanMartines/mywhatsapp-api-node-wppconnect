(function ($) {
    "use strict";
    $.fn.bsStrongPass = function (options) {
        var $target = $(this);
        // Recebe opções pela inicialização
        if(!$target.is('input')){
            throw ('O elemento alvo deve ser um input.');
        }
        var settings = $.extend({
                trigger : 'focus',
                html : true,
                placement : 'top',
                levels : ['Inválida','Fraca','Boa','Forte'],
                txLevel : 'Nível de Senha: ',
                txTips : 'Para uma senha mais segura utilize, letras minúsculas, letras maiúsculas, '+
                         'números e caracteres especiais. Não utilize senhas óbvias como seu nome, '+
                         'data de nascimento, palavras completas e etc...',
                 txRequired : 'Mínimo de oito dígitos com letras e números.',
                 showPass : false
                 
        }, options);
        
        if($target.data('placement') !== undefined) settings.placement = $target.data('placement');
        if($target.data('levels') !== undefined) settings.levels = $target.data('levels').split(',');
        if($target.data('txlevel') !== undefined) settings.txLevel = $target.data('txlevel');
        if($target.data('txtips') !== undefined) settings.txTips = $target.data('txtips');
        if($target.data('txrequired') !== undefined) settings.txRequired = $target.data('txrequired');
        if($target.data('showpass') !== undefined) settings.showPass = $target.data('showpass');
        
        $target.attr('data-toggle','popover');
        $target.attr('data-trigger',settings.trigger);
        $target.attr('data-html',settings.html);
        $target.attr('data-placement',settings.placement);
        
        $target.attr('data-content','<p><small>'+settings.txRequired+'</small></p>'+
                '<h4 style="margin-bottom:0">'+settings.txLevel+'<small class="strong-pass-text">'+settings.levels[0]+'</small></h4>'+
                '<div class="progress" style="height:5px;border-radius:0; margin-bottom:2px;">'+
                '<div class="progress-bar p-strong-length" style="width:0;"></div></div>'+
                '<small>'+settings.txTips+'</small>');
        
        if(settings.showPass){
            $target.wrap('<div class="input-group bs-pass-show"></div>');
            var $btShowPass = $('<span class="input-group-addon" style="cursor:pointer;"><i class="fa fa-eye"></i></span>');
            $('.bs-pass-show').append($btShowPass);
            if($target.data('rtpass')){
                var $rtPass = $($(this).data('rtpass'));
                $rtPass.wrap('<div class="input-group bs-pass-show-rt"></div>');
                var $btRTShowPass = $('<span class="input-group-addon" style="cursor:pointer;"><i class="fa fa-eye"></i></span>');
                $('.bs-pass-show-rt').append($btRTShowPass);
            }
        }
        
        $target.popover();
        
        $target.on('keyup click focus change',function(e){
            e.preventDefault();
            var password = $(this).val();
            var forca = 0;
            //Se a senha for menor do que 8 caracteres retorna msg
            //if (password.length < 8) {
            if (!password.match(/^.*(?=.{8,})(?=.*\d)(?=^(?:[^a-zA-Z]*[a-zA-Z])).*$/)) {
                $('.strong-pass-text').html(settings.levels[0]);
                $('.p-strong-length').css('width','1%')
                    .removeClass('progress-bar-warning progress-bar-danger progress-bar-info progress-bar-success')
                    .addClass('progress-bar-danger');
                return settings.levels[0];
            }
            //se maior do que 8 forca +1
            if (password.length > 8) {
                forca += 1;
            }
            //se conter letra minusculas +1
            if (password.match(/([a-z])/)) {
                forca += 1;
            }
            //Se conter números forca +1
            if (password.match(/([0-9])/)) {
                forca += 1;
            }
            //Se conter letra maiúsculas +1
            if (password.match(/([A-Z])/)) {
                forca += 1;
            }
            //Se conter caracter especial +1
            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
                forca += 1;
            }
            //se forca menor que 2 fraco
            if (forca <= 3) {
                $('.strong-pass-text').html(settings.levels[1]);
                $('.p-strong-length').css('width','33%')
                    .removeClass('progress-bar-warning progress-bar-danger progress-bar-info progress-bar-success')
                    .addClass('progress-bar-warning');
                return settings.levels[1];
            }
            else if (forca == 4) {
                $('.strong-pass-text').html(settings.levels[2]);
                $('.p-strong-length').css('width','66%')
                    .removeClass('progress-bar-warning progress-bar-danger progress-bar-info progress-bar-success')
                    .addClass('progress-bar-info');
                return settings.levels[2];
            }
            else if (forca > 4) {
                $('.strong-pass-text').html(settings.levels[3]);
                $('.p-strong-length').css('width','100%')
                    .removeClass('progress-bar-warning progress-bar-danger progress-bar-info progress-bar-success')
                    .addClass('progress-bar-success');
                return settings.levels[3];
            }
            
        });
        
        $btShowPass.click(function(){
           var type = $(this).siblings('input').attr('type') == 'password' ? 'text' : 'password';
           var iconClass = $(this).find('i').hasClass('fa fa-eye') ? 'fa fa-eye-slash' : 'fa fa-eye';
           $(this).siblings('input').attr('type',type);
           $(this).find('i').removeClass().addClass(iconClass);
        });
        if($btRTShowPass != undefined){
            $btRTShowPass.click(function(){
                var type = $(this).siblings('input').attr('type') == 'password' ? 'text' : 'password';
                var iconClass = $(this).find('i').hasClass('fa fa-eye') ? 'fa fa-eye-slash' : 'fa fa-eye';
                $(this).siblings('input').attr('type',type);
                $(this).find('i').removeClass().addClass(iconClass);
            });
        }
    };
}(jQuery));