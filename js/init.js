//------------------------------------------------------------------------------
// Die Ergebnistabelle und das Ladebild werden zuerst versteckt
$("#result-table").ready(function(){
  $("#auswertung").hide();
  $("#result-table").hide();
  $("#loading").hide();
});

$(document).ready(function() {

  initSlideout();

  $("#checkboxPlusUpvotes").change(function(){handlePlusCheckboxes("checkboxPlusUpvotes")});
  $("#checkboxPlusComments").change(function(){handlePlusCheckboxes("checkboxPlusComments")});
  $("#checkboxPlusResteems").change(function(){handlePlusCheckboxes("checkboxPlusResteems")});
  $("#checkboxPlusFollower").change(function(){handlePlusCheckboxes("checkboxPlusFollower")});

  handleTableFieldTags();

});

$(document).ready(function() {

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

});

$(document).ready(function() {

  $( window ).resize(function() {
    slideout.close();
    refreshSlideout();
  });

});

//------------------------------------------------------------------------------
// Wenn die Seite geladen ist, werden die Input-Handler gesetzt (Author, Link)
// und der Handler für den Submit-Bottun gesetzt
$(document).ready(function() {

  handleInputUrl();
  handleInputAuthor();
  handleInputLink();

  handleAlerts();

  checkGet($_GET("author"), $_GET("link"));

  $(document).on('submit', '#dateneingabe', function() {

    slideout.close();

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

});
