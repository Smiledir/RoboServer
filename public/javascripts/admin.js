
var search = function() {

    var input = document.getElementById("search").value.toUpperCase();
    console.log(input);
    var allTD = $("table tr td");
    var isSarchId = $("#idSearch").is(':checked');
    allTD.each(function () {
        $(this).parent().attr("style", "display : none");
    });

    allTD.each(function () {
        if(!isSarchId && $(this).find("div").attr("col") == "_id") return true;
        if ($(this).find("div").text().toUpperCase().indexOf(input) > -1) {
            $(this).parent().attr("style", "display : ");
        }
    });
}
$(document).ready(function(){
    $("#idSearch").click(function(){
        search();
    });

    $("table tbody tr td .btn-primary").click(function(){
        var data = {};
        console.log("aaza");
        $(this).parent().parent().children().each(function () {
            console.log($(this).find("div").attr("col") + " : " + $(this).find("div").text())
            var key = $(this).find("div").attr("col");
            var val = $(this).find("div").text();
            if (key != undefined) data[key] = val;
        });

        console.log(data);

        $.post("admin/update", data)
            .done(function () {
                console.log("save success");
            })
            .fail(function () {
                console.log("error");
            });
    });

    $("table tbody tr td .btn-danger").click(function(){
        var row = $(this).parent().parent();
        row.children().each(function () {

            var key = $(this).find("div").attr("col");

            if(key == "_id"){
                var val = $(this).find("div").text();

                $.post("admin/delete", {_id : val})
                    .done(function () {
                        row.fadeOut();
                        console.log("save success");
                    })
                    .fail(function () {
                        console.log("error");
                    });
            }
        });
    });
});
