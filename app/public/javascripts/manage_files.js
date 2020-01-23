$(function () {
    console.log("entrei")
    var cont = 1;
    $("#plus1").click(e => {
        e.preventDefault()
        cont++;
        var newFileInput = $('<div></div>', {id: 'f'+cont})
        var ficheiroInput = $('<input/>', {type:'file', name:'file'})

        $("#lista").append(newFileInput);
        $("#f"+cont).append(ficheiroInput);
    });
})