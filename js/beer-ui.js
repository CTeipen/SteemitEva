// Die Ergebnistabelle und das Ladebild werden zuerst versteckt
$("#result-table").ready(function(){
  $("#auswertung").hide();
  $("#result-table").hide();
  $("#loading").hide();
});

// Wenn die Seite geladen ist, werden die Input-Handler gesetzt (Author, Link)
// und der Handler für den Submit-Bottun gesetzt
$(document).ready(function() {

  $("#checkboxPlusUpvotes").change(function(){handlePlusCheckboxes("checkboxPlusUpvotes")});
  $("#checkboxPlusComments").change(function(){handlePlusCheckboxes("checkboxPlusComments")});
  $("#checkboxPlusResteems").change(function(){handlePlusCheckboxes("checkboxPlusResteems")});
  $("#checkboxPlusFollower").change(function(){handlePlusCheckboxes("checkboxPlusFollower")});

  handleTableFieldTags();

  $('#saveSettings').click(function(){

    var errorList = handleSaveSettings();

    if(errorList.length == 0){
      addAlert(alertStates.SUCCESS, "Daten wurden gespeichert!");
      slideout.close();
    }else{
      for (var i = 0; i < errorList.length; i++) {
        addAlert(alertStates.ERROR, errorList[i]);
      }
    }

  });

  handleInputAuthor();
  handleInputLink();

  handleAlerts();

  checkGet();

  $(document).on('submit', '#dateneingabe', function() {

    parent = $('#inputAuthor').val();
    parentPermlink = $('#inputLink').val();

    dataList = [];

    $("#auswertung").show();
    $("#result-table").hide();
    $(".bootstrap-table").hide();
    $("#loading").show();
    $("#prost i").addClass("fa-spin");

    $('#result-table').bootstrapTable("destroy");

    var tmp = handleSaveSettings();

    $('#evaluation-title').empty();
    $('#evaluation-title').append(getEvaluationTitle());

    evaluate(function() {
      fillUIWithData();

      var randomI = $('button[name=refresh] i');
      randomI.removeClass('glyphicon-refresh icon-refresh');
      randomI.addClass('glyphicon-random icon-random');

      $('button[name=refresh]').prop('title', 'Randomize');
      $('button[name=refresh]').click(randomizeTable);
    });

    //$("#eingabe").addClass("hidden");

    return false;
   });

});

//--- INIT -- END

function randomizeTable(){
  dataList.shuffle();
  $('#result-table').bootstrapTable("destroy");
  fillUIWithData();

  var randomI = $('button[name=refresh] i');
  randomI.removeClass('glyphicon-refresh icon-refresh');
  randomI.addClass('glyphicon-random icon-random');

  $('button[name=refresh]').prop('title', 'Randomize');
  $('button[name=refresh]').click(randomizeTable);
}

//--- Fill GUI ---

function buildTableHead(){

  var tableTheadRow = $("#result-table thead tr");
  var wantedFields = $('#inputTableFields').tagsinput('items');

  //console.log(wantedFields);

  tableTheadRow.empty();

  for (var i = 0; i < wantedFields.length; i++) {

    var field = getFieldObj(wantedFields[i]);
    if(field != undefined && field.title != ""){

      var str = '<th';

      if(field.dataSortable != ""){
        str+= ' data-sortable="' + field.dataSortable + '"';
      }

      if(field.dataFormatter != ""){
        str+= ' data-formatter="' + field.dataFormatter + '"';
      }

      if(field.datafield != ""){
        str+= ' data-field="' + field.datafield + '"';
      }

      str += ' scope="col">' + field.title + '</th>';


      tableTheadRow.append(str);

    }
  }



}

function getEvaluationTitle(){

  var title = "";

  for (var i = 0; i < queueFunctions.length; i++) {

    switch (queueFunctions[i]) {

      case queueFunction.POSTVOTES:
      case queueFunction.PLUSVOTES: title += "Upvotes";
                                    break;

      case queueFunction.POSTCOMMENTS:
      case queueFunction.PLUSCOMMENTS: title += "Kommentare";
                                      break;

      case queueFunction.POSTRESTEEMS:
      case queueFunction.PLUSRESTEEMS: title += "Resteems";
                                    break;

      case queueFunction.PLUSFOLLOWER: title += "Follower";
                                    break;

      case queueFunction.COMMENTLINKS: title += "Kommentarlinks";
                                    break;

      case queueFunction.AUSWERTUNG: title += "Auswertung";
                                    break;

        break;
      default:

    }

    if(queueFunctions.length > 1){

      if(i == 0){

        title += "<br><small>";

      }else if(i < queueFunctions.length - 1){

        title += ", ";

      }else if(i < queueFunctions.length){

        title += "</small>";

      }
    }
  }

  return title;

}

function fillUIWithData(){

  buildTableHead();

  var dataSet = [];

  for (var i = 0; i < dataList.length; i++) {

    var parVote = ((dataList[i].mainUpvote.percent != undefined) ? dataList[i].mainUpvote.percent / 100 : 0);
    var comVotes = ((dataList[i].comment != "") ? dataList[i].comment.net_votes : 0);
    var kommentar = ((dataList[i].comment != "") ? dataList[i].comment : undefined);
    var kommentarZaehler = ((dataList[i].commentCount != undefined) ? dataList[i].commentCount : 0);

    var link = "";

    if(kommentar != undefined){
      link = '<a href="?author=' + dataList[i].account + '&link=' + kommentar.permlink + '">' + kommentar.permlink + '</a>';
    }

    var row = {
      account: dataList[i].account,
      permlink: "",
      upvote: parVote,
      commentLink: link,
      commentBody: ((kommentar != undefined) ? kommentar.body : ""),
      commentVotes: ((kommentar != undefined) ? kommentar.net_votes : "n/a"),
      commentReplies: ((kommentar != undefined) ? kommentar.children : "n/a"),
      commentCount: kommentarZaehler,
      reblogged: dataList[i].mainResteemed ? '<i class="text-success glyphicon glyphicon-ok"></i>' : '<i class="text-danger glyphicon glyphicon-remove"></i>',
      postVotes: "",
      wertung: "",
      follower: dataList[i].following ? '<i class="text-success glyphicon glyphicon-ok"></i>' : '<i class="text-danger glyphicon glyphicon-remove"></i>'
    };

    dataSet.push(row);

  }

  $("#loading").fadeOut();
  $("#prost i").removeClass("fa-spin");

  //console.log(dataSet);

  $('#result-table').bootstrapTable({
    data: dataSet
  });

  $("#result-table").fadeIn();
  $(".bootstrap-table").fadeIn();
}

// --- ALERTS ------------------------------------------------------------------

// Der Oberfläche werden über diese Funktion Flächen eingeblendet, die die in
// 'msg' gespeicherte Nachricht im Status 'state' anzeigen.
//
// Die Anzeige der Fläche kann über das 'x' beendet werden.
// Nach 3 Sekunden blendet sich die Fläche von alleine aus.
//
// In beiden Fällen wird die Fläche von der Oberfläche gelöscht.
// Zusätzlich wird die Meldung in der Konsole geloggt.
function addAlert(state, msg){

  var output = '';
  var id = 'alert-' + state + '-' + alertCounter;
  alertCounter++;

  output += '<div id="'+id+'" class="alert alert-'+state+' alert-dismissible" role="alert">';
  output += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

  switch (state) {
    case alertStates.INFO:
      output += '<strong>Hinweis:</strong> ';
      break;

    case alertStates.ERROR:
      output += '<strong>Fehler!</strong> ';
      break;

    case alertStates.SUCCESS:
      output += '<strong>Erfolgreich!</strong> ';
      break;
    default:

  }

  output += msg;
  output += '</div>';

  $('#myAlert').append(output);
  console.log(state, msg);

  setTimeout(function(){

    $('#'+id).fadeOut(400, function(){
      $('#'+id).remove();
    });

  }, 3000);

}

function handleAlerts(){
  $('#myAlert .alert').on('closed.bs.alert', function () {
    $( this ).remove();
  });
}

// --- CHECKGET ----------------------------------------------------------------

function checkGet(){

  var getAuthor = $_GET("author");
  var getLink = $_GET("link");

  if(getAuthor != undefined){
    $('#inputAuthor').val(getAuthor);
    $( "#inputAuthor" ).keyup();

    setTimeout(function(){

      if(!$('#inputLink').prop('disabled') && getLink != undefined){
        $('#inputLink').val(getLink);
        $( "#inputLink" ).keyup();

        setTimeout(function(){

          if(!$('#prost').prop('disabled')){
            $('#prost').click();
          }

        }, 1000);

      }

    }, 1000);


  }

}

// --- SLIDEOUT ----------------------------------------------------------------

window.onload = function() {

  document.getElementById("menu").className =
  document.getElementById("menu").className.replace(/\bhidden\b/,'');

  slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'side': 'right'
  });

  document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
    slideout.toggle();
  });

  document.querySelector('.menu').addEventListener('click', function(eve) {
    if (eve.target.nodeName === 'A') { slideout.close(); }
  });
};


// --- HANDLER -----------------------------------------------------------------

function handleTableFieldTags(){

  $('#checkboxPlusUpvotes').prop("checked", false);
  $('#checkboxPlusComments').prop("checked", false);
  $('#checkboxPlusResteems').prop("checked", false);
  $('#checkboxPlusFollower').prop("checked", false);

  for (var i = 0; i < tableFields.postVotes.length; i++) {
    $('#inputTableFields').tagsinput('add', tableFields.postVotes[i].title);
  }

  $('input[type=radio][name=postDatenbasis]').change(function() {

    $('#inputTableFields').tagsinput('removeAll');

    var tags = [];

    switch (this.value) {
      case queueFunction.POSTVOTES:
        tags = tableFields.postVotes;
        break;

      case queueFunction.POSTCOMMENTS:
        tags = tableFields.postComments;
        break;

      case queueFunction.POSTRESTEEMS:
        tags = tableFields.postResteems;
        break;

      default:
      break;
    }

    for (var i = 0; i < tags.length; i++) {
      $('#inputTableFields').tagsinput('add', tags[i].title);
    }

    $('#inputTableFields').tagsinput('refresh');

    handlePlusInformation(this.value);

  });

}

function handlePlusCheckboxes(box) {

  var tags = [];

  switch ($('#'+box).val()) {
    case queueFunction.PLUSVOTES:
      tags = tableFields.plusVotes;
      break;

    case queueFunction.PLUSCOMMENTS:
      tags = tableFields.plusComments;
      break;

    case queueFunction.PLUSRESTEEMS:
      tags = tableFields.plusResteems;
      break;

    case queueFunction.PLUSFOLLOWER:
      tags = tableFields.plusFollower;
      break;

    default:
    break;
  }

  if($('#'+box).prop("checked")){

    for (var i = 0; i < tags.length; i++) {
      $('#inputTableFields').tagsinput('add', tags[i].title);
    }

  }else{

    for (var i = 0; i < tags.length; i++) {
      $('#inputTableFields').tagsinput('remove', tags[i].title);
    }

  }

  $('#inputTableFields').tagsinput('refresh');

}

function handlePlusInformation(selected) {

  var up = $("#plusUpvotes");
  var com = $("#plusComments");
  var re = $("#plusResteems");
  var fol = $("#plusFollower");

  var upCB = $("#checkboxPlusUpvotes");
  var comCB = $("#checkboxPlusComments");
  var reCB = $("#checkboxPlusResteems");
  var folCB = $("#checkboxPlusFollower");

  upCB.prop("checked", false);
  comCB.prop("checked", false);
  reCB.prop("checked", false);
  folCB.prop("checked", false);

  switch (selected) {
    case queueFunction.POSTVOTES:
      up.addClass("hidden");
      com.removeClass("hidden");
      re.removeClass("hidden");
      fol.removeClass("hidden");
      break;

    case queueFunction.POSTCOMMENTS:
      up.removeClass("hidden");
      com.addClass("hidden");
      re.removeClass("hidden");
      fol.removeClass("hidden");
      break;

    case queueFunction.POSTRESTEEMS:
      up.removeClass("hidden");
      com.removeClass("hidden");
      re.addClass("hidden");
      fol.removeClass("hidden");
      break;

    default:
    break;
  }

}

function handleSaveSettings(){

  var errorList = [];

  queueFunctions = [];

  if($("#radioPostVotes").prop("checked")){
    queueFunctions.push(queueFunction.POSTVOTES);
  }

  if($("#radioPostComments").prop("checked")){
   queueFunctions.push(queueFunction.POSTCOMMENTS);
  }

  if($("#radioPostResteems").prop("checked")){
   queueFunctions.push(queueFunction.POSTRESTEEMS);
  }

  // -----------------------------------------------------

  if($("#checkboxPlusUpvotes").prop("checked")){
    queueFunctions.push(queueFunction.PLUSVOTES);
  }

  if($("#checkboxPlusComments").prop("checked")){
   queueFunctions.push(queueFunction.PLUSCOMMENTS);
  }

  if($("#checkboxPlusResteems").prop("checked")){
   queueFunctions.push(queueFunction.PLUSRESTEEMS);
  }

  if($("#checkboxPlusFollower").prop("checked")){
   queueFunctions.push(queueFunction.PLUSFOLLOWER);
  }

  // -----------------------------------------------------

  if($("#checkboxPostCommentsLinks").prop("checked")){
   queueFunctions.push(queueFunction.COMMENTLINKS);
  }

  if($("#checkboxWertung").prop("checked")){
   queueFunctions.push(queueFunction.AUSWERTUNG);

   var resteem = $("#inputResteemPoints").val();

   if(resteem != "" && jQuery.isNumeric(resteem)){
     resteemPoints = resteem;
   }else{
     errorList.push("Keine Zahl für Resteempunkte angegeben.");
   }
  }

  //console.log(queueFunctions);

  return errorList;

}

function handleInputAuthor(){

  $( "#inputAuthor" ).keyup(function() {

    if($( "#inputAuthor" ).val().length >= 3 && $( "#inputAuthor" ).val().length <= 16){

      parent = $( "#inputAuthor" ).val().toLowerCase();

      $( "#loadingAuthor" ).removeClass();
      $( "#loadingAuthor" ).addClass("fas fa-spinner fa-pulse");

      steem.api.getAccounts([parent], function(err, result) {

        if(result != undefined){
          changeInputState(result.length, "Author");
        }

      });

    }else{

      $( "#inputAuthorGroup" ).removeClass("has-success has-error");
      $( "#loadingAuthor" ).addClass("hidden");

      $( "#inputLink").prop("disabled", true);
      $( "#inputLink").val("");

      $( "#prost").prop("disabled", true);

    }

  });

}

function handleInputLink(){

  $( "#inputLink" ).keyup(function() {

    if($( "#inputLink" ).val().length > 2){

      parentPermlink = $( "#inputLink" ).val().toLowerCase();

      $( "#loadingLink" ).removeClass();
      $( "#loadingLink" ).addClass("fas fa-spinner fa-pulse");

      steem.api.getContent(parent, parentPermlink, function(err, result) {

        if(result.id > 0){
          mainPost = result;
        }
        changeInputState(result.id, "Link");

      });

    }else{

      $( "#inputLinkGroup" ).removeClass("has-success has-error");
      $( "#loadingLink" ).addClass("hidden");

    }

  });

}

function changeInputState(respsonse, type){

  if(respsonse > 0){

    $( "#input"+type+"Group" ).removeClass("has-error");
    $( "#input"+type+"Group" ).addClass("has-success");

    $( "#loading"+type ).removeClass();
    $( "#loading"+type ).addClass("fas fa-check");

    if(type == "Author"){
      $( "#inputLink").prop("disabled", false);
    }

    if(type == "Link"){
      $( "#prost").prop("disabled", false);
    }

  }else{

    $( "#input"+type+"Group" ).removeClass("has-success");
    $( "#input"+type+"Group" ).addClass("has-error");

    $( "#loading"+type ).removeClass();
    $( "#loading"+type ).addClass("fas fa-times");

    if(type == "Author"){

      $( "#inputLinkGroup" ).removeClass("has-success has-error");
      $( "#loadingLink" ).addClass("hidden");

      $( "#inputLink").prop("disabled", true);
      $( "#inputLink").val("");
    }

    if(type == "Link"){
      $( "#prost").prop("disabled", true);
    }

  }

}

// Sorgt für konstante Indizes in der ersten Spalte der Tabelle
function runningFormatter(value, row, index) {
    return index + 1;
}
