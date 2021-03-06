/**
* MainPost gibt es immer, muss ja eine Grundlage geben, auf der man aufsetzen KONSTANTEN
*
* Dann lassen sich
*   - die Upvotes des Posts
*   - die Kommentare des Posts
*   - die Resteems des Posts
*  auslesen
*
* Dabei muss festgelegt sein, was die Grundlage für die weitere Verarbeitung ist.
* D.h. dass vorher gesagt wird:
*   von den Kommentaren
*   von den Resteems
*   von den Upvotes ausgehend
*
**/

//------------------------------------------------------------------------------
//
function evaluate(_callback){

  if(queueFunctions.length > 0) {

    switch (queueFunctions[0]) {

      case queueFunction.POSTVOTES:     getMainPostVotes();
                                        if(dataList.length > 0){
                                          plusCallbackCheck(_callback);
                                        }else{
                                          _callback();
                                        }
                                        break;

      case queueFunction.POSTCOMMENTS:  getMainPostComments(function(success){
                                          if(success){
                                            plusCallbackCheck(_callback);
                                          }else{
                                            _callback();
                                          }
                                        });
                                        break;

      case queueFunction.POSTRESTEEMS:  getMainPostRebloggedBy(function() {
                                          plusCallbackCheck(_callback);
                                        });
                                        break;

      default:

    }

  }

}

//------------------------------------------------------------------------------
//
function plusCallbackCheck(_callback){

  if(queueFunctions.length > 1){
    for(var y = 1; y < queueFunctions.length; y++){
      plusSwitch(queueFunctions[y], function(expression){
        if(jQuery.inArray(expression, queueFunctions) == queueFunctions.length - 1){
          _callback();
        }
      });
    }
  } else {
    _callback();
  }

}

//------------------------------------------------------------------------------
//
function plusSwitch(expression, _callbackPlus) {

  switch (expression) {

    case queueFunction.PLUSVOTES:
      getMainPostVotesPlus();
      _callbackPlus(queueFunction.PLUSVOTES);
      break;

    case queueFunction.PLUSCOMMENTS:
      getMainPostCommentsPlus(function() {
        _callbackPlus(queueFunction.PLUSCOMMENTS);
      });
      break;

    case queueFunction.PLUSRESTEEMS:
      getMainPostRebloggedByPlus(function(arr){

        for (var i = 0; i < arr.length; i++) {
          for (var x = 0; x < dataList.length; x++) {
            if(dataList[x].account == arr[i]){
              dataList[x].mainResteemed = true;
            }
          }
        }

        _callbackPlus(queueFunction.PLUSRESTEEMS);
      });
      break;

    case queueFunction.PLUSFOLLOWER:
      getFollowers(function(arr){

        for (var i = 0; i < arr.length; i++) {
          for (var x = 0; x < dataList.length; x++) {
            if(dataList[x].account == arr[i].follower){
              dataList[x].following = true;
            }
          }
        }

        _callbackPlus(queueFunction.PLUSFOLLOWER);
      });
      break;

    default:
      _callbackPlus();
      break;

  }
}

//------------------------------------------------------------------------------
//
function getMainPostRebloggedByPlus(_callback){

  steem.api.getRebloggedBy(parent, parentPermlink, function(err, result) {

    if(result != undefined){

      _callback(result);

    }else{

      _callback([]);

    }

  });

}

//------------------------------------------------------------------------------
//
function getMainPostRebloggedBy(_callback){

  steem.api.getRebloggedBy(parent, parentPermlink, function(err, result) {

    if(result != undefined){

      for (var x = 0; x < result.length; x++) {

          dataList.push({
            comment: "",
            account: result[x],
            replyPostLink: "",
            replyPost: '',
            mainUpvote: "",
            mainResteemed: true,
            following: false
          });

      }

      _callback();

    }else{
      _callback();
    }

  });

}

//------------------------------------------------------------------------------
//
function getMainPostVotesPlus(){

  var counter = 0;
  var tmp = [];

  for (var i = 0; i < mainPost.active_votes.length; i++) {

    for (var x = 0; x < dataList.length; x++) {

      if(mainPost.active_votes[i].voter == dataList[x].account){

          dataList[x].mainUpvote = mainPost.active_votes[i];

      }

    }

  }

}

//------------------------------------------------------------------------------
//
function getMainPostVotes(){

  for (var i = 0; i < mainPost.active_votes.length; i++) {

    dataList.push({
      comment: "",
      commentCount: 0,
      account: mainPost.active_votes[i].voter,
      replyPostLink: "",
      replyPost: '',
      mainUpvote: mainPost.active_votes[i],
      mainResteemed: false,
      following: false
    });

  }

}

//------------------------------------------------------------------------------
//
function getReplyPosts(_callback){

  var counter = 0;
  var clone = [];

  for (var i = 0; i < dataList.length; i++) {

    var splitLink = dataList[i].replyPostLink.split("/");
    var link = splitLink[splitLink.length - 1];

    steem.api.getContent(dataList[i].account, link, function(err, result) {

      if(result != undefined){

        clone.push([counter, result]);

      }

      counter++;

      if(dataList.length == counter){
          _callback(clone);
      }

    });

  }

}

//------------------------------------------------------------------------------
//
function getMainPostComments(_callback){

  steem.api.getContentReplies(parent, parentPermlink, function (err, result) {

    var counter = 0;

    if(result != undefined && result.length > 0){

      for (var i = 0; i < result.length; i++) {

        var jsonMetadata = JSON.parse(result[i].json_metadata);
        var links;

        if(jsonMetadata.links != undefined && jsonMetadata.links.length == 1){

           links = jsonMetadata.links;

        }


          dataList.push({
            comment: result[i],
            account: result[i].author,
            replyPostLink: links,
            replyPost: '',
            mainUpvote: 0,
            mainResteemed: false,
            following: false
          });

          counter++;


      }

      _callback(true);

    }else{

      _callback(false);

    }

  });

}

//------------------------------------------------------------------------------
//
function getMainPostCommentsPlus(_callback){

  steem.api.getContentReplies(parent, parentPermlink, function (err, result) {

    var tmp = [];
    var counter = 0;

    if(result != undefined && result.length > 0){

      for (var i = 0; i < result.length; i++) {
        tmp.push(result[i].author);
      }

      for (var x = 0; x < dataList.length; x++) {

        var str = tmp + "";
        var commentCount = (str.split(dataList[x].account)).length - 1;

        dataList[x].commentCount = commentCount;

        counter++;

      }

      _callback();

    }else{

      _callback();

    }

  });

}

//------------------------------------------------------------------------------
//
function getFollowerCount(_countCallback){
  steem.api.getFollowCount(parent, function(err, result) {
    if(result != undefined){
      _countCallback(result.follower_count);
    }else{
      _countCallback(0);
    }
  });
}

//------------------------------------------------------------------------------
//
function getFollowers(_callback){
  getFollowerCount(function(anzahl){

    var follower = [];
    var x = 0;

    if(anzahl > 0){

      var times = Math.ceil(anzahl / 1000);

      for (var i = 0; i < times; i++) {

        getFollowerPart(i * 1000, function(arr){
          $.merge(follower, arr);
          x++;

          if(x == times){
            _callback(follower);
          }
        });

      }

    }else{
      _callback(follower);
    }

  });
}

//------------------------------------------------------------------------------
//
function getFollowerPart(start, _callback){
  steem.api.getFollowers(parent, start, 'blog', 1000, function(err, result) {
    if(result != undefined){
      _callback(result);
    }else{
      _callback([]);
    }
  });
}
