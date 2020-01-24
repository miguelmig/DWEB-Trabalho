$(function () 
{
    $('.markdown-content').each(function(index) {
        var element = $(this);
        console.log(element);
        var markdown_text = element.text();
        var unsanitized_html = marked(markdown_text);
        $(this).html(unsanitized_html);
        $(this).children("p").each(function(index) {
            this.classList.add("mb-0")
        })
    })
});