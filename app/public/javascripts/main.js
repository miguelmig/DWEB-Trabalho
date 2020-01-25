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

function updateSubscriptions(userid) {

    event.preventDefault();
    
    axios.put("/user/" + userid + '/subscribed_tags')
        .then()
        .catch(error => console.log(error));
}

$.fn.exists = function () {
    return this.length !== 0;
}

function adicionaComentario(postid)
{
    event.preventDefault();
    console.log("Adicionando comentário ao post: " + postid);
    var formElement = document.getElementById('add-comment-form-' + postid);
    console.log(formElement);
    const formData = new FormData(formElement);
    const formEntries = formData.entries();
    const json = Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})));
    axios.post("/post/" + postid + "/comment", json)
    .then(response => {
        const json = response.data;
        const comments = json.comments;
        console.log(comments)
        for(let i = 0; i < comments.length; i++)
        {
            const comment = comments[i];
            var current_comment_elem = $('#' + comment._id);
            if(current_comment_elem.exists())
            {
                continue;
            }

            console.log("found new comment, id: " + comment._id);
            //TODO: Create new divs with this comment
        }
    })
    .catch(error => console.log(error));
}