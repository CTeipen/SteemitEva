// --- KONSTANTEN --------------------------------------------------------------

var alertStates = {
  INFO : "info",
  ERROR : "danger",
  SUCCESS: "success",
  WARNING: "warning"
}

var queueFunction = {
  POSTVOTES:    "postVotes",
  POSTCOMMENTS: "postComments",
  POSTRESTEEMS: "postResteems",
  PLUSVOTES:    "plusVotes",
  PLUSCOMMENTS: "plusComments",
  PLUSRESTEEMS: "plusResteems",
  COMMENTLINKS: "postCommentLinks",
  AUSWERTUNG: "auswertung"
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
  postVotes: ["#", "Account", "Hauptbeitrag Upvote"],
  postComments: ["#", "Account", "Link", "Kommentar", "Kommentar Votes", "Kommentar Antworten"],
  postResteems: ["#", "Account"],
  plusVotes: ["Hauptbeitrag Upvote"],
  plusComments: ["Anzahl Kommentare"],
  plusResteems: ["Resteemed"]
};

// Spalten für die Tabelle
var tabeleHeadFields = [{
  dataFormatter: "runningFormatter",
  datafield: "id",
  title: "#",
  dataSortable: "false"
},{
  dataFormatter: "",
  datafield: "account",
  title: "Account",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "permlink",
  title: "Permlink",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "upvote",
  title: "Hauptbeitrag Upvote",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "commentLink",
  title: "Link",
  dataSortable: "false"
},{
  dataFormatter: "",
  datafield: "commentBody",
  title: "Kommentar",
  dataSortable: "false"
},{
  dataFormatter: "",
  datafield: "commentVotes",
  title: "Kommentar Votes",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "commentReplies",
  title: "Kommentar Antworten",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "commentCount",
  title: "Anzahl Kommentare",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "reblogged",
  title: "Resteemed",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "postVotes",
  title: "Post Votes",
  dataSortable: "true"
},{
  dataFormatter: "",
  datafield: "wertung",
  title: "Wertung",
  dataSortable: "true"
}];
