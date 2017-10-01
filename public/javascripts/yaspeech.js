console.log('you are awesome')

var options2;

window.onload = function () {
    var inputFinished = function (text) {
        // Финальный текст.
        console.log(text);
        if(text == '') return;
        document.getElementById('num').innerHTML = text;
    }

    var options = {
        apikey: '1ade204f-3df4-4f25-a6b6-ca10deabeddd',
        model: 'numbers',
        lang: 'ru-RU',
        onInputFinished: inputFinished
    };

    var textline = new ya.speechkit.Textline('yasp', options);

    options2 = {
        apikey: '1ade204f-3df4-4f25-a6b6-ca10deabeddd',
        model: 'numbers',
        lang: 'ru-RU',
        doneCallback: inputFinished
    };
}

var makeRecognize = function(){
    ya.speechkit.recognize(options2);
}

