function reqListener() {
  keeper_data = JSON.parse(this.responseText);

  var e = document.getElementById('main')

  var year = new Date().getFullYear()

  var season = keeper_data[year]

  e.appendChild(createText(year + " Season"));
  e.appendChild(createText("Salary cap: " + season.cap.points + " points."));

  for (const team of season.teams) {

    let team_data_js = {
      players: []
    }

    e.appendChild(createText(team.owner.user_name));
    var table = document.createElement("table")
    e.appendChild(table);
    var row = table.insertRow();
    row.insertCell().appendChild(createText("Player"));
    row.insertCell().appendChild(createText("Points"));
    row.insertCell().appendChild(createText("Round"));
    row.insertCell().appendChild(createText("Keep?"));

    for (const player of team.players) {
      var row = table.insertRow();
      if (player.position === "DEF") {
        row.insertCell().appendChild(createText(player.name + ",&nbsp" + player.position));
      } else  {
        row.insertCell().appendChild(createText(player.name + ",&nbsp" + player.position + " - " + player.team));
      }
      row.insertCell().appendChild(createText(player.total_points));
      row.insertCell().appendChild(createText("0")); // TODO: set round when data is ready

      let input = document.createElement("input");
      input.type = "checkbox";
      input.onchange = () => {
        let keeper_points = 0;
        for (const p of team_data_js.players) {
          if (p.keep_input.checked) {
            keeper_points += p.points_scored;
          }
        }
        let keeper_points_text = keeper_points;
        if (keeper_points > season.cap.points) {
          keeper_points_text += "!!!"; // TODO: replace with highlighting the box red
        }
        team_data_js.total_points_element.innerHTML = keeper_points_text;
      }
      row.insertCell().appendChild(input);

      let player_data = {
        points_scored: player.total_points,
        round: 0,
        keep_input: input
      };

      team_data_js.players.push(player_data);
    }
    var tally_row = table.insertRow();
    tally_row.insertCell().innerHTML = "Total:"
    let team_point_total = createText("0");
    team_data_js.total_points_element = team_point_total;
    tally_row.insertCell().appendChild(team_point_total);

    tally_row.insertCell(); // Round column placeholder

    var clear_all_button = document.createElement("input")
    clear_all_button.type = "button"
    clear_all_button.value = "Clear All"
    clear_all_button.onclick = ()=> {
      for (const p of team_data_js.players) {
        p.keep_input.checked = false;
      }
      // TODO: probably a better way to do this
      team_data_js.players[0].keep_input.onchange();
    }
    tally_row.insertCell().appendChild(clear_all_button);

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
