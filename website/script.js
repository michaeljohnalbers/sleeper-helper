function reqListener() {
  keeper_data = JSON.parse(this.responseText);

  var e = document.getElementById('main')

  var year = new Date().getFullYear()
  var season = keeper_data[year]

  var topBox = document.createElement("div");
  topBox.classList.add("topBox");
  e.appendChild(topBox);

  topBox.appendChild(createTextBlock(year + " Season", "season"));

  topBox.appendChild(createText("Keeper Limits", "keeper_limit_header"));
  var list = document.createElement("ul");
  topBox.appendChild(list)
  var salary_cap_points_element = document.createElement("li");
  list.appendChild(salary_cap_points_element);
  salary_cap_points_element.appendChild(createText(season.cap.points + " points", "plain_text"));

  // Kind of a hack, but things get out of whack with this on mobile and it's easier to just make it disappear.
  var showHideGroup = document.createElement("div");
  showHideGroup.classList.add("invisible_on_mobile");
  topBox.appendChild(showHideGroup);
  addShowHide(showHideGroup);

  var scrollBox = document.createElement("div");
  scrollBox.classList.add("scrollBox");
  e.appendChild(scrollBox);

  var teamsGroup = document.createElement("div");
  teamsGroup.classList.add("teamsGroup");
  scrollBox.appendChild(teamsGroup);

  for (const team of season.teams) {
    let team_data_js = {
      players: []
    }

    var teamGroup = document.createElement("div");
    teamGroup.classList.add("teamGroup");
    teamsGroup.appendChild(teamGroup);

    teamGroup.appendChild(createTextBlock(team.owner.user_name, "owner"));
    var table = document.createElement("table");
    table.classList.add("playersTable");
    teamGroup.appendChild(table);
    var row = table.insertRow();
    row.insertCell().appendChild(createText("Player", "header_row"));
    row.insertCell().appendChild(createText("Position", "header_row"));
    row.insertCell().appendChild(createText("Points", "header_row"));
    row.insertCell().appendChild(createText("Round", "header_row"));
    row.insertCell().appendChild(createText("Keep?", "header_row"));

    for (const player of team.players) {
      var row = table.insertRow();
      row.classList.add(player.position);

      var player_name = player.name;
      if (player.position !== "DEF") {
        player_name += " (" + player.team + ")"
      }
      row.insertCell().appendChild(createText(player_name, "plain_text"));
      row.insertCell().appendChild(createText(player.position), "plain_text");
      row.insertCell().appendChild(createText(player.total_points, "plain_text"));
      row.insertCell().appendChild(createText(player.draft_round_cost, "plain_text"));

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
        let total_points_element = team_data_js.total_points_element;
        if (keeper_points > season.cap.points) {
          total_points_element.classList = ["error_text"];
        } else {
          total_points_element.className = ["plain_text"];
        }
        total_points_element.innerHTML = keeper_points_text;
      }
      row.insertCell().appendChild(input);

      let player_data = {
        points_scored: player.total_points,
        round: 0,
        keep_input: input
      };

      team_data_js.players.push(player_data);
    }

    // Just for a little visual space before tally row. Probably nicer way to do this.
    table.insertRow().insertCell();

    var tally_row = table.insertRow();
    tally_row.insertCell();
    tally_row.insertCell().appendChild(createText("Total:", "summary"));
    let team_point_total = createText("0", "plain_text");
    team_data_js.total_points_element = team_point_total;
    tally_row.insertCell().appendChild(team_point_total);

    tally_row.insertCell(); // Round column placeholder

    var clear_all_button = document.createElement("input")
    clear_all_button.type = "button"
    clear_all_button.value = "Clear All"
    clear_all_button.onclick = () => {
      for (const p of team_data_js.players) {
        p.keep_input.checked = false;
      }
      // Call the onchange callback to reset the total value.
      // TODO: probably a better way to do this
      team_data_js.players[0].keep_input.onchange();
    }
    tally_row.insertCell().appendChild(clear_all_button);
  }

  scrollBox.appendChild(createTextBlock("Player data gathered on " + season.metadata.player_data_pull_date, "footnote"));
  scrollBox.appendChild(createTextBlock("Player round cost last updated on " + season.metadata.player_rankings_gen_date, "footnote"));
  scrollBox.appendChild(createTextBlock(season.metadata.notes, "footnote"));
}

function createTextBlock(text, elementClass) {
    var node = document.createElement("div")
    node.classList.add(elementClass)
    node.innerHTML = text
    return node
}

function createText(text, elementClass) {
    var node = document.createElement("span")
    node.classList.add(elementClass)
    node.innerHTML = text
    return node
}

function addShowHide(container) {
  container.appendChild(createText("Show/Hide"));
  var positions = ["QB", "RB", "WR", "TE", "K", "DEF"];
  for (const position of positions) {
    var hideButton = document.createElement("BUTTON");
    hideButton.classList.add("position_button");
    hideButton.appendChild(document.createTextNode(position));
    hideButton.onclick = (event) => {
      console.log(event);
      var rows = document.getElementsByClassName(position);
      var display = '';
      var textDecoration = '';
      if (rows[0].style.display == '') {
        display = 'none';
        textDecoration = 'line-through';
      }
      for (const row of rows) {
        row.style.display = display;
      }
      event.target.style.textDecoration = textDecoration;
    };
    container.appendChild(hideButton);
  }
}

window.onload = function() {
  const req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("GET", "keeper_data.json");
  req.setRequestHeader("Accept", "application/json");
  req.send();
}
