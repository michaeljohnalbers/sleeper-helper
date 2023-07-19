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
      let points_scored_node = createText(player.total_points, "plain_text")
      row.insertCell().appendChild(points_scored_node);
      let draft_round_cost_node = createText(player.draft_round_cost, "plain_text");
      row.insertCell().appendChild(draft_round_cost_node);

      let input = document.createElement("input");
      input.type = "checkbox";
      input.onchange = () => {
        /*
          There is a lot of looping over the same data (player list). However, the player lists are never
          going to be more than maybe 20 players, so the repetition shouldn't slow things down noticeably.
          And keeping the various adjustments discrete makes the code much easier to read.
        */

        /*
          Update cap cost for each player
          For each player kept with the same round cost, except the first, adjust the points cost by 25% * X, where
          X is the number of players kept in that round. For example, supposed all of the following players
          are kept
            Player 1, 100 pts, round 3 -> 100 pts
            Player 2,  70 pts, round 3 -> 75 * 1.25 = 94 pts
            Player 3,  60 pts, round 3 -> 60 * 1.50 = 90 pts
            Player 4,  50 pts, round 4 -> 50 pts
        */
        for (let ii = 0; ii < team_data_js.players.length; ++ii) {
          const p = team_data_js.players[ii]
          let point_cost_string = p.points_scored;
          if (p.keep_input.checked) {
            let multiplier = 1.0;
            // Since the player list is sorted by draft round cost, look at all of the players above the
            // currently selected player and check for the same original round cost.
            for (let jj = ii-1; jj >= 0; --jj) {
              const player_before = team_data_js.players[jj];
              if (player_before.keep_input.checked && player_before.original_round_cost === p.original_round_cost) {
                multiplier += 0.25;
              }
            }
            p.adjusted_points_scored = Math.round(multiplier * p.points_scored);
            point_cost_string += "->" + p.adjusted_points_scored;
          }
          p.points_scored_node.innerHTML = point_cost_string
        }

        /*
          Update overall points for keepers
        */
        let keeper_points = 0;
        for (const p of team_data_js.players) {
          if (p.keep_input.checked) {
            keeper_points += p.adjusted_points_scored;
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

        /*
          Update draft round cost
        */
        let next_round_available = 0;
        let max_round_available = season.roster_size;
        let round_taken = new Array(season.roster_size).fill(false);
        for (const p of team_data_js.players) {
          var round_cost_string = p.original_round_cost
          if (p.keep_input.checked) {
            let modified_round = -1;

            for (let ii = 0; ii < round_taken.length; ++ii) {
              if (false == round_taken[ii] && (ii+1) >= p.original_round_cost) {
                modified_round = ii + 1;
                round_taken[ii] = true;
                break;
              }
            }

            // No spot was found, this likely means the player is a late round keeper and
            // we need to find an earlier spot to allocate to them.
            if (-1 == modified_round) {
               for (let ii = round_taken.length-1; ii >= 0; --ii) {
                 if (false == round_taken[ii]) {
                   modified_round = ii + 1;
                   round_taken[ii] = true;
                   break;
                 }
               }
            }

            round_cost_string += "->" + modified_round;
          }
          p.draft_round_cost_node.innerHTML = round_cost_string;
        }
      }
      row.insertCell().appendChild(input);

      let player_data = {
        name: player_name,
        points_scored: player.total_points,
        adjusted_points_scored: player.total_points,
        points_scored_node: points_scored_node,
        original_round_cost: player.draft_round_cost,
        keep_input: input,
        draft_round_cost_node: draft_round_cost_node
      };

      team_data_js.players.push(player_data);
    }

    // Sorting the players by draft cost ordering to make updating the values much easier
    team_data_js.players.sort((a,b) => {
      if (a.original_round_cost < b.original_round_cost) {
         return -1;
      }
      if (a.original_round_cost > b.original_round_cost) {
         return 1;
      }

      // Each item compared after here ensures consistent sort order

      // Secondary sort, descending points order
      if (a.points_scored > b.points_scored) {
        return -1;
      }
      if (a.points_scored < b.points_scored) {
        return 1;
      }
      // Final differentiator
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

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
