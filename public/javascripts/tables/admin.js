
const pageName = "admin";


var search = function() {

    let input = document.getElementById("search").value.toUpperCase();
    let allTD = $("table tr td");
    let isSarchId = $("#idSearch").is(':checked');
    allTD.each(function () {
        $(this).parent().attr("style", "display : none");
    });

    allTD.each(function () {
        if(!isSarchId && $(this).find("div").attr("col") == "_id") return true;
        if ($(this).find("div").text().toUpperCase().indexOf(input) > -1) {
            $(this).parent().attr("style", "display : ");
        }
    });
};

$(document).ready(function(){
    $("#idSearch").click(function(){
        search();
    });

    $("#addButton").click(function(){
        let data = {};

        $("#addGroup").children().each(function () {
            let key = $(this).find("span").text();
            let val = $(this).find("input").val();
            data[key] = val;
        });

        $.post(pageName, data)
            .done(function (res) {

                let tr = ($("<tr></tr>"));
                $.each(res, function(index, value){
                    let td = ($("<td></td>"));
                    let div = ($("<div></div>"));
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
        let data = {};

        $(this).parent().parent().children().each(function () {
            let key = $(this).find("div").attr("col");
            let val = $(this).find("div").text();
            if (key !== undefined) data[key] = val;
        });

        $.ajax({
            url: pageName,
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
        let row = $(this).parent().parent();
        row.children().each(function () {

            let key = $(this).find("div").attr("col");

            if(key === "_id"){
                let val = $(this).find("div").text();

                $.ajax({
                    url: pageName,
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
