$(function () {
    var cont = 1;
    $("#plus1").click(e => {
        e.preventDefault()
        cont++;
        var newFileInputDiv = $('<div></div>', {class: "mb-2", id: 'f'+cont})
        var newFileInput = $('<input/>', {type:'file', name:'files'})

        $("#listOfFiles").append(newFileInputDiv);
        $("#f"+cont).append(newFileInput);
    });
})