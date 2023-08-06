import './style.css';
import keeper_data from './keeper_data.json'

/**
 * Initializes the webpage. Generates all the content on the page.
 */
function initialize() {

  let e = document.createElement('div')

  const year = new Date().getFullYear().toString() as keyof typeof keeper_data;
  const season = keeper_data[year]

  let topBox = document.createElement("div");
  topBox.classList.add("topBox");
  e.appendChild(topBox);

  topBox.appendChild(createTextDiv(year + " Season", "season"));

  topBox.appendChild(createTextSpan("Keeper Limits", "keeper_limit_header"));
  let list = document.createElement("ul");
  topBox.appendChild(list)
  let salary_cap_points_element = document.createElement("li");
  list.appendChild(salary_cap_points_element);
  salary_cap_points_element.appendChild(createTextSpan(season.cap.points + " points", "plain_text"));

  // Kind of a hack, but things get out of whack with this on mobile, and it's easier to just make it disappear.
  let showHideGroup = document.createElement("div");
  showHideGroup.classList.add("invisible_on_mobile");
  topBox.appendChild(showHideGroup);
  addShowHide(showHideGroup);

  let scrollBox = document.createElement("div");
  scrollBox.classList.add("scrollBox");
  e.appendChild(scrollBox);

  let teamsGroup = document.createElement("div");
  teamsGroup.classList.add("teamsGroup");
  scrollBox.appendChild(teamsGroup);

  type PlayerJs = {
    adjusted_points_scored: number;
    draft_round_cost_node: HTMLSpanElement;
    keep_input : HTMLInputElement;
    name: String;
    original_round_cost: number;
    points_scored: number;
    points_scored_node: HTMLSpanElement;
  }

  class TeamDataJs {
    players: PlayerJs[];
    total_points_element: HTMLElement;

    constructor() {
      this.players = [];
    }
  }

  for (const team of season.teams) {
    let team_data_js : TeamDataJs = new TeamDataJs();

    let teamGroup = document.createElement("div");
    teamGroup.classList.add("teamGroup");
    teamsGroup.appendChild(teamGroup);

    teamGroup.appendChild(createTextDiv(team.owner.user_name, "owner"));
    let table = document.createElement("table");
    table.classList.add("playersTable");
    teamGroup.appendChild(table);
    let headerRow = table.insertRow();
    headerRow.insertCell().appendChild(createTextSpan("Player", "header_row"));
    headerRow.insertCell().appendChild(createTextSpan("Position", "header_row"));
    headerRow.insertCell().appendChild(createTextSpan("Points", "header_row"));
    headerRow.insertCell().appendChild(createTextSpan("Round", "header_row"));
    headerRow.insertCell().appendChild(createTextSpan("Keep?", "header_row"));

    for (const player of team.players) {
      let row = table.insertRow();
      row.classList.add(player.position);

      let player_name = player.name;
      if (player.position !== "DEF") {
        player_name += " (" + player.team + ")"
      }
      row.insertCell().appendChild(createTextSpan(player_name, "plain_text"));
      row.insertCell().appendChild(createTextSpan(player.position, "plain_text"));
      let points_scored_node = createTextSpan(player.total_points.toString(), "plain_text")
      row.insertCell().appendChild(points_scored_node);
      let draft_round_cost_node = createTextSpan(player.draft_round_cost.toString(), "plain_text");
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
          let point_cost_string = p.points_scored.toString();
          if (p.keep_input.checked) {
            let multiplier = 1.0;
            // Since the player list is sorted by draft round cost, look at all the players above the
            // currently selected player and check for the same original round cost.
            for (let jj = ii-1; jj >= 0; --jj) {
              const player_before = team_data_js.players[jj];
              if (player_before.keep_input.checked && player_before.original_round_cost === p.original_round_cost) {
                multiplier += 0.25;
              }
            }
            p.adjusted_points_scored = Math.round(multiplier * p.points_scored);
            point_cost_string += "->" + p.adjusted_points_scored.toString();
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
        total_points_element.className = (keeper_points <= season.cap.points)
            ? "plain_text"
            : "error_text";
        total_points_element.innerHTML = keeper_points_text.toString();

        /*
          Update draft round cost
        */
        let round_taken = new Array(season.roster_size).fill(false);
        for (const p of team_data_js.players) {
          let round_cost_string = p.original_round_cost.toString();
          if (p.keep_input.checked) {
            let modified_round = -1;

            for (let ii = 0; ii < round_taken.length; ++ii) {
              if (false === round_taken[ii] && (ii+1) >= p.original_round_cost) {
                modified_round = ii + 1;
                round_taken[ii] = true;
                break;
              }
            }

            // No spot was found, this likely means the player is a late round keeper and
            // we need to find an earlier spot to allocate to them.
            if (-1 === modified_round) {
               for (let ii = round_taken.length-1; ii >= 0; --ii) {
                 if (false === round_taken[ii]) {
                   modified_round = ii + 1;
                   round_taken[ii] = true;
                   break;
                 }
               }
            }

            round_cost_string += "->" + modified_round.toString();
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

    let tally_row = table.insertRow();
    tally_row.insertCell();
    tally_row.insertCell().appendChild(createTextSpan("Total:", "summary"));
    let team_point_total = createTextSpan("0", "plain_text");
    team_data_js.total_points_element = team_point_total;
    tally_row.insertCell().appendChild(team_point_total);

    tally_row.insertCell(); // Round column placeholder

    let clear_all_button = document.createElement("input")
    clear_all_button.type = "button"
    clear_all_button.value = "Clear All"
    clear_all_button.onclick = () => {
      for (const p of team_data_js.players) {
        p.keep_input.checked = false;
      }
      // Call the onchange callback to reset the total value.
      // TODO: probably a better way to do this
      team_data_js.players[0].keep_input.onchange(null);
    }
    tally_row.insertCell().appendChild(clear_all_button);
  }

  scrollBox.appendChild(createTextDiv("Player data gathered on " + season.metadata.player_data_pull_date, "footnote"));
  scrollBox.appendChild(createTextDiv("Player round cost last updated on " + season.metadata.player_rankings_gen_date, "footnote"));
  scrollBox.appendChild(createTextDiv(season.metadata.notes, "footnote"));

  return e;
}

/**
 * Creates a text block wrapped in a 'div' element
 * @param text text
 * @param elementClass class name of the 'span' element (for styling), can be null
 */
function createTextDiv(text: string, elementClass: string) {
    let node = document.createElement("div")
    node.classList.add(elementClass)
    node.innerHTML = text
    return node
}

/**
 * Creates a text block wrapped in a 'span' element
 * @param text text
 * @param elementClass class name of the 'span' element (for styling), can be null
 */
function createTextSpan(text: string, elementClass: string) {
    let node = document.createElement("span")
    node.classList.add(elementClass)
    node.innerHTML = text
    return node
}

/**
 * Builds the HTML element to show/hide players of each position
 * @param container HTML container element in which to place all the generated DOM elements
 */
function addShowHide(container: Element) {
  container.appendChild(createTextSpan("Show/Hide", null));
  const positions = ["QB", "RB", "WR", "TE", "K", "DEF"];
  for (const position of positions) {
    let hideButton = document.createElement("BUTTON");
    hideButton.classList.add("position_button");
    hideButton.appendChild(document.createTextNode(position));
    hideButton.onclick = (event) => {
      let rows = document.getElementsByClassName(position) as HTMLCollectionOf<HTMLElement>;
      let display = '';
      let textDecoration = '';
      if (rows[0].style.display === '') {
        display = 'none';
        textDecoration = 'line-through';
      }
      for (const row of rows) {
        row.style.display = display;
      }
      let target = event.target as HTMLButtonElement;
      target.style.textDecoration = textDecoration;
    };
    container.appendChild(hideButton);
  }
}

document.body.appendChild(initialize());
