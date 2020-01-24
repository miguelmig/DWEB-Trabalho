function apagaComentario(postid, commentid)
{
    event.preventDefault();
    console.log('Vou tentar apagar o ' + postid + 'e comentário' + commentid + '...');
    axios.delete("/post/" + postid + '/comment/' + commentid)
        .then(_ => {
            $('#' + commentid).remove()
        })
        .catch(error => console.log(error));
}