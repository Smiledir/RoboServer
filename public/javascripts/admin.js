
var search = function() {

    var input = document.getElementById("search").value.toUpperCase();
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

    $("#addButton").click(function(){
        var data = {};

        $("#addGroup").children().each(function () {
            var key = $(this).find("span").text();
            var val = $(this).find("input").val();
            data[key] = val;
        });

        $.post("admin", data)
            .done(function (res) {
                var indexes;
                for(var i = indexes.length -1; i >= 0; i--){
                    indexes[i]
                }
                $("table thead tr th").each(function () {
                    //indexes[]
                });
                var tr = ($("<tr></tr>"));
                $.each(res, function(index, value){
                    var td = ($("<td></td>"));
                    var div = ($("<div></div>"));
                    div.attr("col", index);
                    div.val(value);
                    td.append(div)
                    tr.append(td);
                });
                $("table").append(tr);
            })
            .fail(function () {
                console.log("error");
            });
    });

    $("table tbody tr td .btn-primary").click(function(){
        var data = {};

        $(this).parent().parent().children().each(function () {
            var key = $(this).find("div").attr("col");
            var val = $(this).find("div").text();
            if (key !== undefined) data[key] = val;
        });

        $.ajax({
            url: 'admin',
            type: 'PUT',
            data:  data,
            success: function() {
                console.log("save success");
            },
            error: function() {
                console.log("error");
            }
        });
    });

    $("table tbody tr td .btn-danger").click(function(){
        var row = $(this).parent().parent();
        row.children().each(function () {

            var key = $(this).find("div").attr("col");

            if(key === "_id"){
                var val = $(this).find("div").text();

                $.ajax({
                    url: 'admin',
                    type: 'DELETE',
                    data:  {_id : val},
                    success: function() {
                        row.fadeOut();
                        console.log("save success");
                    },
                    error: function() {
                        console.log("error");
                    }
                });
            }
        });
    });
});
