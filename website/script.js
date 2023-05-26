function reqListener() {
  keeper_data = JSON.parse(this.responseText);

  var e = document.getElementById('main')

  var year = new Date().getFullYear()

  var season = keeper_data[year]

  e.appendChild(createText(year + " Season"));
  e.appendChild(createText("Salary cap: " + season.cap.points));

  for (const team of season.teams) {
    e.appendChild(createText(team.owner.user_name));
    var table = document.createElement("table")
    e.appendChild(table);
    var row = table.insertRow();
    row.insertCell().appendChild(createText("Player"));
    row.insertCell().appendChild(createText("Points"));
    row.insertCell().appendChild(createText("Keep?"));

    for (const player of team.players) {
      var row = table.insertRow();
      row.insertCell().appendChild(createText(player.name + ",&nbsp" + player.position + "-" + player.team));
      row.insertCell().appendChild(createText(player.total_points));
      row.insertCell().innerHTML = "<input type=\"checkbox\">"
    }
    var tally_row = table.insertRow();
    tally_row.insertCell().innerHTML = "Total:"
    tally_row.insertCell().innerHTML = "0"
    e.appendChild(document.createElement("br"));
  }
}

function createText(text) {
    var node = document.createElement("div")
    node.classList.add("text")
    node.innerHTML = text
    return node
}

window.onload = function() {
  const req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("GET", "keeper_data.json");
  req.setRequestHeader("Accept", "application/json");
  req.send();
}
