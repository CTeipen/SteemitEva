
function evaluate(){

  getMainPostComments(function(){

    getReplyPosts(function(arr){

      while (arr.length > 0) {

        var replyPost = arr.shift();

        for (var i = 0; i < dataList.length; i++) {

          if(dataList[i].account == replyPost[1].author && dataList[i].replyPostLink.includes(replyPost[1].permlink)){

            dataList[i].replyPost = replyPost[1];
            break;

          }

        }

      }

      getMainPostVotes();

      getMainPostRebloggedBy(function(arr) {

        for (var i = 0; i < arr.length; i++) {

          for (var x = 0; x < dataList.length; x++) {

            if(arr[i] == dataList[x].account){

              dataList[x].mainResteemed = true;

            }

          }

        }

        fillUIWithData();

      });

    });

  });

}

function getMainPostRebloggedBy(_callback){

  steem.api.getRebloggedBy(parent, parentPermlink, function(err, result) {

    if(result != undefined){

      _callback(result);

    }

  });

}

function getMainPostVotes(){

  var counter = 0;

  for (var i = 0; i < mainPost.active_votes.length; i++) {

    for (var x = 0; x < dataList.length; x++) {

      if(mainPost.active_votes[i].voter == dataList[x].account){

        dataList[x].mainUpvote = mainPost.active_votes[i];

      }

    }

  }

}

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

function getMainPostComments(_callback){

  steem.api.getContentReplies(parent, parentPermlink, function (err, result) {

    var counter = 0;

    if(result != undefined && result.length > 0){

      for (var i = 0; i < result.length; i++) {

        var jsonMetadata = JSON.parse(result[i].json_metadata);

        if(jsonMetadata.links != undefined && jsonMetadata.links.length == 1){

          dataList.push({
            comment: result[i],
            account: result[i].author,
            replyPostLink: jsonMetadata.links[0],
            replyPost: '',
            mainUpvote: 0,
            mainResteemed: false
          });

          counter++;

        }


      }

      _callback();

    }

  });

}
