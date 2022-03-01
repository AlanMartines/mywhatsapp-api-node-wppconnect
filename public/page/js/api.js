$(document).ready(function() {
    //
    document.getElementById('image').style.visibility = "visible";
    //
    async function getStatus(session) {
        //
        if (!session) {
            //
            document.getElementById('image').style.visibility = "visible";
            document.getElementById('send-btn').disabled = false;
            document.getElementById('image').src = './public/imagens/error.png';
            //$("#description").html("Sistema não iniciado.");
            alert("Digite o nome da sessão antes de continuar...");
            //
        } else {
            axios.get('http://15.228.192.100:3333/status?sessionName=' + session)
                .then(function(response) {
                    console.log(response.data);
                    if (response.data.result == 'STARTING') {
                        //
                        document.getElementById('image').style.visibility = "visible";
                        document.getElementById('send-btn').disabled = true;
                        document.getElementById('image').src = './public/imagens/loading.gif';
                        $("#description").html("Por favor aguarde, sistema iniciando.");
                        //
                    } else if (response.data.result == 'QRCODE') {
                        getQrcode(session);
                    } else if (response.data.result == 'CONNECTED') {
                        //
                        document.getElementById('image').style.visibility = "visible";
                        document.getElementById('send-btn').disabled = false;
                        document.getElementById('image').src = './public/imagens/ok.jpg';
                        $("#description").html("Sistema iniciado com sucesso.");
                        //
                    } else if (response.data.result == 'CLOSED') {
                        //
                        document.getElementById('image').style.visibility = "visible";
                        document.getElementById('send-btn').disabled = false;
                        document.getElementById('image').src = './public/imagens/error.png';
                        $("#description").html("Sistema fechado.");
                        //
                    } else if (response.data.result == 'NOTFOUND' || response.data.result == 'NOT_FOUND') {
                        //
                        document.getElementById('image').style.visibility = "visible";
                        document.getElementById('send-btn').disabled = false;
                        document.getElementById('image').src = './public/imagens/error.png';
                        $("#description").html("Sistema não iniciado.");
                        //
                    }
                }).catch(function(err) {
                    //
                    document.getElementById('image').style.visibility = "visible";
                    document.getElementById('send-btn').disabled = false;
                    document.getElementById('image').src = './public/imagens/error.png';
                    $("#description").html("Sistema não iniciado.");
                    //
                });
            //
        }
    }
    //
    async function startar(session) {
        //
        if (!session) {
            //
            document.getElementById('image').style.visibility = "visible";
            document.getElementById('send-btn').disabled = false;
            document.getElementById('image').src = './public/imagens/error.png';
            //$("#description").html("Sistema não iniciado.");
            alert("Digite o nome da sessão antes de continuar...");
            //
        } else {

            axios.get('http://15.228.192.100:3333/start?sessionName=' + session)
                .then(function(response) {
                    console.log(response.data);
                    if (response.data.message == 'STARTING' || response.data.message == 'QRCODE') {
                        reload(session);
                    } else {
                        //
                        getStatus(session);
                        //	
                    }
                }).catch(function(err) {
                    //
                    document.getElementById('image').style.visibility = "visible";
                    document.getElementById('send-btn').disabled = false;
                    document.getElementById('image').src = './public/imagens/error.png';
                    $("#description").html("Erro ao iniciar sistema.");
                    //
                });
        }
    }
    //
    async function getQrcode(session) {
        //
        if (!session) {
            //
            document.getElementById('image').style.visibility = "visible";
            document.getElementById('send-btn').disabled = false;
            document.getElementById('image').src = './public/imagens/error.png';
            //$("#description").html("Sistema não iniciado.");
            alert("Digite o nome da sessão antes de continuar...");
            //
        } else {

            axios.get('http://15.228.192.100:3333/qrcode?sessionName=' + session)
                .then(function(response) {
                    //
                    document.getElementById('image').style.visibility = "visible";
                    document.getElementById('send-btn').disabled = false;
                    document.getElementById('image').src = response.data.qrcode;
                    $("#description").html("Por favor, efetue a leitura do qr code informado.");
                    //
                    i = 0;
                    qr = response.data.message;
                    //
                }).catch(function(err) {
                    //
                    document.getElementById('image').style.visibility = "visible";
                    document.getElementById('send-btn').disabled = false;
                    document.getElementById('image').src = './public/imagens/error.png';
                    $("#description").html("Erro ao gerar qr code.");
                    //
                });
            //
        }
    }
    //
    async function reload(session) {
        //
        if (!session) {
            //
            document.getElementById('image').style.visibility = "visible";
            document.getElementById('send-btn').disabled = false;
            document.getElementById('image').src = './public/imagens/error.png';
            //$("#description").html("Sistema não iniciado.");
            alert("Digite o nome da sessão antes de continuar...");
            //
        } else {
            setInterval(function() {
                getStatus(session);
            }, 3000);
        }
    }
    //
    $(".startar").click(function() {
        var session = $("#session").val();
        startar(session);
    });
    //
    $(".status").click(function() {
        var session = $("#session").val();
        getStatus(session);
    });
    //
});