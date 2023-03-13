const dbkey = "bpfim1vh"

export function getValue(itemkey) {
  $.ajax({
      type: "GET",
      url: "https://keyvalue.immanuel.co/api/KeyVal/GetValue/" + dbkey + "/" + itemkey,
      contentType: false,
      processData: false
    }).done(function (data) {
    }).fail(function(err){
  });
}

export function updateValue(itemkey, itemval) {
  $.ajax({
      type: "POST",
      url: "https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/" + dbkey + "/" + itemkey + "/" + itemval,
      contentType: false,
      processData: false
     }).done(function (data) {
     }).fail(function(err){
  });
}

export function actOnValue(itemkey, action) {
  $.ajax({
      type: "POST",
      url: "https://keyvalue.immanuel.co/api/KeyVal/ActOnValue/" + dbkey + "/" + itemkey + "/" + action,
      contentType: false,
      processData: false
     }).done(function (data) {
     }).fail(function(err){
  });
}