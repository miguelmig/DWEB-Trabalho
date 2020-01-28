
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
    var tags = $('#tag-field').val();
    console.log(tags);
    axios.put("/user/" + userid + '/subscribed_tags', {
        tags: tags
    })
    .then(response => {
        $("#editSubscriptionsModal").modal('toggle')
        window.location.reload()
    })
    .catch(error => console.log(error));
}

function updateProfilePic(userid) {
    
    event.preventDefault();
    var formElement = document.getElementById('update-profile-pic');
    const formData = new FormData(formElement);
    const formEntries = formData.entries();
    var json = Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})))

    //console.log(json.profile_pic.type)
    //console.dir(json)
    axios.put("/user/" + userid + "/profile_pic", json, {
        header: {
            'Content-Type': json.profile_pic.type,
        },
    })
    .then(response => {
        $("#editProfilePicModal").modal('toggle')
        window.location.reload()
    })
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
        /*
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
        */
        window.location.reload();
    })
    .catch(error => console.log(error));
}

function guardarLogin()
{
    console.log("entrei")
    var formElement = document.getElementById('login-form');
    const formData = new FormData(formElement);
    const formEntries = formData.entries();
    const json = Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})));
    console.log(json['username'])
    
    sessionStorage.setItem("username", json['username'])
}