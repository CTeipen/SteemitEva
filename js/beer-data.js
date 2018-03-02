// --- KONSTANTEN --------------------------------------------------------------

//
var alertStates = {
  INFO : "info",
  ERROR : "danger",
  SUCCESS: "success",
  WARNING: "warning"
}

//
var queueFunction = {
  POSTVOTES:    "postVotes",
  POSTCOMMENTS: "postComments",
  POSTRESTEEMS: "postResteems",
  PLUSVOTES:    "plusVotes",
  PLUSCOMMENTS: "plusComments",
  PLUSRESTEEMS: "plusResteems",
  PLUSFOLLOWER: "plusFollower",
  COMMENTLINKS: "postCommentLinks",
  AUSWERTUNG: "auswertung"
}

//
var tableHeadEnum = {

  id: {
    dataFormatter: "runningFormatter",
    datafield: "id",
    title: "#",
    dataSortable: "false",
    datafiltercontrol: ""
  },

  account: {
    dataFormatter: "",
    datafield: "account",
    title: "Account",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  permlink: {
    dataFormatter: "",
    datafield: "permlink",
    title: "Permlink",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  upvote: {
    dataFormatter: "",
    datafield: "upvote",
    title: "Hauptbeitrag Upvote in %",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  commentLink: {
    dataFormatter: "",
    datafield: "commentLink",
    title: "Link",
    dataSortable: "false",
    datafiltercontrol: "input"
  },

  commentBody: {
    dataFormatter: "",
    datafield: "commentBody",
    title: "Kommentar",
    dataSortable: "false",
    datafiltercontrol: "input"
  },

  commentVotes: {
    dataFormatter: "",
    datafield: "commentVotes",
    title: "Kommentar Votes",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  commentReplies: {
    dataFormatter: "",
    datafield: "commentReplies",
    title: "Antworten",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  commentCount: {
    dataFormatter: "",
    datafield: "commentCount",
    title: "Anzahl Kommentare",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  reblogged: {
    dataFormatter: "",
    datafield: "reblogged",
    title: "Resteemed",
    dataSortable: "true",
    datafiltercontrol: "select"
  },

  postVotes: {
    dataFormatter: "",
    datafield: "postVotes",
    title: "Post Votes",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  wertung: {
    dataFormatter: "",
    datafield: "wertung",
    title: "Wertung",
    dataSortable: "true",
    datafiltercontrol: "input"
  },

  follower: {
    dataFormatter: "",
    datafield: "follower",
    title: "Follower",
    dataSortable: "true",
    datafiltercontrol: "select"
  }
}

// --- VARIABLEN ---------------------------------------------------------------

// Alert Zähler, damit die ID eindeutig bleibt.
var alertCounter = 0;

// Autor des Hauptbeitrags
var parent = '';

// Link zum Hauptbeitrag
var parentPermlink = '';

// Hauptbeitrag
var mainPost = '';

// Punkte für Resteems (Auswertung)
var resteemPoints = 3;

// Auswertungskriterien
var queueFunctions = [];

// Liste der Tabellendaten
var dataList = [];

// Slideout für die Einstellungen;
var slideout;

// Mögliche Tabellen Felder für die Basisdaten
var tableFields = {

  postVotes: [tableHeadEnum.id,
              tableHeadEnum.account,
              tableHeadEnum.upvote],

  postComments: [tableHeadEnum.id,
                 tableHeadEnum.account,
                 tableHeadEnum.commentLink,
                 tableHeadEnum.commentBody,
                 tableHeadEnum.commentVotes,
                 tableHeadEnum.commentReplies],

  postResteems: [tableHeadEnum.id,
                 tableHeadEnum.account],

  plusVotes: [tableHeadEnum.upvote],

  plusComments: [tableHeadEnum.commentCount],

  plusResteems: [tableHeadEnum.reblogged],

  plusFollower: [tableHeadEnum.follower]

};

// Spalten für die Tabelle
var tabeleHeadFields = [
  tableHeadEnum.id,
  tableHeadEnum.account,
  tableHeadEnum.permlink,
  tableHeadEnum.upvote,
  tableHeadEnum.commentLink,
  tableHeadEnum.commentBody,
  tableHeadEnum.commentVotes,
  tableHeadEnum.commentReplies,
  tableHeadEnum.commentCount,
  tableHeadEnum.reblogged,
  tableHeadEnum.postVotes,
  tableHeadEnum.wertung,
  tableHeadEnum.follower
];

//------------------------------------------------------------------------------
//
function getFieldObj(fieldTitle){

  for (var i = 0; i < tabeleHeadFields.length; i++) {
    if(fieldTitle != "" && tabeleHeadFields[i].title == fieldTitle){
      return tabeleHeadFields[i];
    }
  }

  return undefined;

}
