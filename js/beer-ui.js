//------------------------------------------------------------------------------
// Die Ergebnistabelle und das Ladebild werden zuerst versteckt
$("#result-table").ready(function(){
  $("#auswertung").hide();
  $("#result-table").hide();
  $("#loading").hide();
});

//------------------------------------------------------------------------------
// Wenn die Seite geladen ist, werden die Input-Handler gesetzt (Author, Link)
// und der Handler für den Submit-Bottun gesetzt
$(document).ready(function() {

  initSlideout();

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

  handleInputUrl();
  handleInputAuthor();
  handleInputLink();

  handleAlerts();

  checkGet($_GET("author"), $_GET("link"));

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

      $('button[name=refresh] i').removeClass('glyphicon-refresh icon-refresh');
      $('button[name=refresh] i').addClass('glyphicon-random icon-random');
      $('button[name=refresh]').prop('title', 'Randomize');

      $('button[name=refresh]').click(function(){
        dataList.shuffle();
        $('#result-table').bootstrapTable("load", prepareData());
      });

    });

    return false;
   });

   $( window ).resize(function() {
     slideout.close();
    refreshSlideout();
  });

});

//------------------------------------------------------------------------------
// Hier werden die Spaltenköpfe zusammengebaut.
// Sie sind abhängig von den Tags, die in der Einstellungen-Sidebar angegeben
// werden können.
function buildTableHead(){

  var tableTheadRow = $("#result-table thead tr");
  var wantedFields = $('#inputTableFields').tagsinput('items');

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

      if(field.datafiltercontrol != ""){
        str+= ' data-filter-control="' + field.datafiltercontrol + '"';
      }

      str += ' scope="col">' + field.title + '</th>';

      tableTheadRow.append(str);

    }

  }

}

//------------------------------------------------------------------------------
// Gibt den Titel der Evaluation zurück.
// Er besteht aus einer <h3>-Überschritft in index.html und einer <small>-Unter-
// überschrift innerhalb der Überschrift.
// Die Überschrift betitelt die Datenbasis und die Unterüberschrift die
// zusätzlich geladenen Daten.
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

function prepareData(){
  var dataSet = [];

  for (var i = 0; i < dataList.length; i++) {

    var parVote = ((dataList[i].mainUpvote.percent != undefined) ? dataList[i].mainUpvote.percent / 100 : 0);
    var parVoteWeight = ((dataList[i].mainUpvote.weight != undefined) ? dataList[i].mainUpvote.weight : 0);
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
      upvoteWeight: parVoteWeight,
      commentLink: link,
      commentBody: ((kommentar != undefined) ? kommentar.body : ""),
      commentVotes: ((kommentar != undefined) ? kommentar.net_votes : "n/a"),
      commentReplies: ((kommentar != undefined) ? kommentar.children : "n/a"),
      commentCount: kommentarZaehler,
      reblogged: dataList[i].mainResteemed ? 'Ja' : 'Nein',
      postVotes: "",
      wertung: "",
      follower: dataList[i].following ? 'Ja' : 'Nein'
    };

    dataSet.push(row);

  }

  return dataSet;
}

//------------------------------------------------------------------------------
//
function fillUIWithData(){

  buildTableHead();

  var dataSet = prepareData();

  $("#loading").fadeOut();
  $("#prost i").removeClass("fa-spin");

  //console.log(dataSet);

  $('#result-table').bootstrapTable({
    data: dataSet,
    pageList: [1,3,5,10,15,20,25,30,50,100,200],
    escape: true
  });

  $("#result-table").fadeIn();
  $(".bootstrap-table").fadeIn();

  $('#evalink').empty();
  var evaLink = '<a class="btn btn-info" href="index.html?author=' + parent + '&link=' + parentPermlink + '">' +
  '<i class="glyphicon glyphicon-link"></i> Link zur Auswertung</a>';
  $('#evalink').append(evaLink);

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

//------------------------------------------------------------------------------
//
function handleAlerts(){
  $('#myAlert .alert').on('closed.bs.alert', function () {
    $( this ).remove();
  });
}

// --- CHECKGET ----------------------------------------------------------------
//
function checkGet(getAuthor, getLink){

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
//
function initSlideout () {

  document.getElementById("menu").className =
  document.getElementById("menu").className.replace(/\bhidden\b/,'');

  var padding = 512;
  var x = $( window ).width() * 0.8;
  if(x <= padding){
    padding = x;
  }

  slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'side': 'left',
    'padding': padding,
    'tolerance': 70
  });

  document.querySelector('.js-slideout-toggle').addEventListener('click', function() {
    slideout.toggle();
  });

  document.querySelector('.menu').addEventListener('click', function(eve) {
    if (eve.target.nodeName === 'A') { slideout.close(); }
  });

};

function refreshSlideout() {

  var padding = 512;
  var x = $( window ).width() * 0.8;
  if(x <= padding){
    padding = x;
  }

  slideout._translateTo = padding;
  slideout._padding = padding;
}


// --- HANDLER -----------------------------------------------------------------

//------------------------------------------------------------------------------
//
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

//------------------------------------------------------------------------------
//
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

//------------------------------------------------------------------------------
//
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

//------------------------------------------------------------------------------
//
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

  return errorList;

}

//------------------------------------------------------------------------------
//
function handleInputUrl(){

  $( "#inputUrl" ).keyup(function() {

    var url = $( "#inputUrl" ).val();

    if(inputCounter != url.length && inputUrl != url){

      if(url.length > 20){

        inputCounter = url.length;
        inputUrl = url;

        var urlParts = url.split("/");

        if(urlParts.length == 6 && urlParts[4].length > 0 && urlParts[5].length > 0){

          var user = urlParts[4].slice(1);
          var permlink = urlParts[5].trim();

          changeInputState(1, "Url");
          checkGet(user, permlink);

        }else{

          changeInputState(0, "Url");

        }

      }else{

        $( "#inputUrlGroup" ).removeClass("has-success has-error");

        inputCounter = 0;
        inputUrl = "";
      }

    }

  });

}

//------------------------------------------------------------------------------
//
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

//------------------------------------------------------------------------------
//
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

//------------------------------------------------------------------------------
//
function changeInputState(response, type){

  if(response > 0){

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

//------------------------------------------------------------------------------
// Sorgt für konstante Indizes in der ersten Spalte der Tabelle
function runningFormatter(value, row, index) {
    return index + 1;
}
