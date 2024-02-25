package com.albersm.sleeperhelper.sleeper;

import com.albersm.sleeperhelper.sleeper.model.*;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static com.albersm.sleeperhelper.Scraper.OBJECT_MAPPER;

public class Sleeper {
    private static final String UNKNOWN = "UNKNOWN";
    private static final String NA = "N/A";
    private final HttpClient client = HttpClient.newHttpClient();
    private final String jwt;
    private final List<RosterDetails> rosterDetails = new ArrayList<>();
    private final int rosterSize;
    private final int year;


    public Sleeper(String jwt, int year) throws Exception {
        this.jwt = jwt;
        this.year = year;

        var playerIds = getPlayerIds();
        var leagueIds = getLeagueIds();
        var currentLeagueId = leagueIds.leagueId();
        var leagueDetails = getLeagueDetail(currentLeagueId);
        var allPlayerStats = getPlayerStats();
        var leagueSettings = getLeagueSettings(currentLeagueId);

        this.rosterSize = leagueSettings.rosterSize();

        for (var user : leagueDetails.data().leagueUsers()) {
            var rosterDetails = new RosterDetails(user.displayName(), user.userId(), new LinkedList<>());

            for (var roster : leagueDetails.data().leagueRosters()) {
                if (roster.ownerId().equals(rosterDetails.owner())) {
                    for (var playerEntry : roster.playerMap().entrySet()) {
                        String playerId = playerEntry.getKey();
                        var pointsScored = calculatePlayerPointsScored(playerId, allPlayerStats,
                                leagueSettings.previousYearScoringSettings());

                        PlayerIds playersIds = playerIds.get(playerId);
                        if (null == playersIds) {
                            throw new RuntimeException("No player Ids found for " + playerId);
                        }

                        SleeperLeaguePlayer player = playerEntry.getValue();

                        PlayerDetails playerDetails = new PlayerDetails(
                                isActive(player.status()),
                                formatName(player),
                                Optional.of(player.position()).orElse(UNKNOWN),
                                pointsScored,
                                Optional.of(player.team()).orElse(NA),
                                Optional.of(playersIds.yahooId()).orElse(-1));
                        rosterDetails.players().add(playerDetails);
                    }
                }

                rosterDetails.players().sort((a,b) -> {
                    // Reverse sort (descending) points
                    var pointsCompare = Integer.compare(b.pointsScored(), a.pointsScored());
                    if (0 == pointsCompare) {
                        return a.name().compareTo(b.name());
                    }
                    return pointsCompare;
                });

                break;
            }
            this.rosterDetails.add(rosterDetails);
        }

        rosterDetails.sort(Comparator.comparing(RosterDetails::owner));
    }

    public List<RosterDetails> getRosterDetails() {
        return rosterDetails;
    }

    public int getRosterSize() {
        return rosterSize;
    }

    private boolean isActive(String status) {
        return null != status && status.compareToIgnoreCase("active") == 0;
    }

    private int calculatePlayerPointsScored(String playerId, List<SleeperPlayerStats> allPlayerStats,
                                            Map<String, Float> scoringSettings) {
        for (var playerStats : allPlayerStats) {
            if (playerStats.playerId().equals(playerId)) {
                float pointsScored = 0.0F;

                for (var scoringSetting : scoringSettings.entrySet()) {
                    var statValue = playerStats.stats().get(scoringSetting.getKey());
                    pointsScored += (statValue * scoringSetting.getValue());
                }

                return (int) pointsScored;
            }
        }

        throw new RuntimeException("No status found for player Id " + playerId);
    }

    private String formatName(SleeperLeaguePlayer player) {
        var firstName = Optional.of(player.firstName()).orElse(UNKNOWN);
        var lastName = Optional.of(player.lastName()).orElse(UNKNOWN);
        return firstName + " " + lastName;
    }

    private record LeagueIds(String leagueId, String previousLeagueId){}

    /**
     * This API call can be seen when loading the app (just https://sleeper.com) the first time, or after a refresh.
     */
    private LeagueIds getLeagueIds() throws Exception {
        String query = """
{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app { my_leagues(exclude_archived: false) {league_id name previous_league_id season status} }"
}""";

        var json = graphqlRequest(query, "Failed to retrieve league details.");

        var initialize = OBJECT_MAPPER.readValue(json, Initialize.class);

        for (var league : initialize.data().myLeagues()) {
            if ("core.fantasy.football.league".equals(league.name()) &&
                    league.season().equals(Integer.toString(year))) {
                return new LeagueIds(league.leagueId(), league.previousLeagueId());
            }
        }

        throw new RuntimeException("Could not find league ID for " + year);
    }

    /**
     * This API call can be seen when loading the initial league page at sleeper.com.
     */
    private SleeperLeagueDetails getLeagueDetail(String leagueId) throws Exception {
        String prefix = """
{
  "operationName": "get_league_detail",
  "variables":{},
  "query":"query get_league_detail { league_rosters(league_id: \\\"""";

        String middle = "\\\"){owner_id player_map} league_users(league_id: \\\"";
        String end = """
\\"){display_name user_id} }"
}""";

        String query = prefix + leagueId + middle + leagueId + end;

        var json = graphqlRequest(query, "Failed to retrieve league details for league " +
                leagueId + ".");

        return OBJECT_MAPPER.readValue(json, SleeperLeagueDetails.class);
    }

    /*
    impl Sleeper {
    fn get_league_settings(&self, league_id: String) -> Result<LeagueSettings, Box<dyn Error>> {
        // This API call can be seen when loading the initial league page at sleeper.com.
        let prefix = r#"{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {metadata(type: \"league_history\", key: \""#;
        let last = r#"\"){ data }}"
}"#;

        let query = format!("{}{}{}", prefix, league_id, last);

        let response = self.graphql_request(query, "Failed to retrieve league metadata.")?;

        let mut league_settings = LeagueSettings {
            previous_year_scoring_settings: HashMap::new(),
            roster_size: 0,
        };

        let previous_year = self.year - 1;
        let league_metadata: Metadata = response.json::<Metadata>().unwrap();
        for lineage in league_metadata.data.metadata.data.lineage.iter() {
            if lineage.season == self.year.to_string() {
                league_settings.roster_size = lineage.roster_positions.len() as i32;
            }
            if lineage.season == previous_year.to_string() {
                league_settings.previous_year_scoring_settings = lineage.scoring_settings.clone();
            }
        }

        if 0 == league_settings.roster_size
            || league_settings.previous_year_scoring_settings.len() == 0
        {
            return Err(Box::new(GeneralError::from_str(
                "No league lineage found for {previous_year} or {self.year}.",
            )));
        }

        Ok(league_settings)
    }
}
     */

    private record LeagueSettings(Map<String, Float> previousYearScoringSettings, int rosterSize) {}

    /**
     * This API call can be seen when loading the initial league page at sleeper.com.
     */
    private LeagueSettings getLeagueSettings(String leagueId) throws Exception {
        String prefix = """
{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {metadata(type: \\"league_history\\", key: \\\"""";

        String end = """
\\"){ data }}"
}""";

        String query = prefix + leagueId + end;
        var json = graphqlRequest(query, "Failed to retrieve league metadata.");

        String yearStr = Integer.toString(year);
        String previousYearStr = Integer.toString(year - 1);

        Map<String, Float> previousYearScoringSettings = null;
        int rosterSize = 0;

        var leagueMetadata = OBJECT_MAPPER.readValue(json, Metadata.class);
        for (var lineage : leagueMetadata.data().metadata().data().lineage()) {
            if (lineage.season().equals(yearStr)) {
                rosterSize = lineage.rosterPositions().size();
            }

            if (lineage.season().equals(previousYearStr)) {
                previousYearScoringSettings = lineage.scoringSettings();
            }
        }

        if (0 == rosterSize || null == previousYearScoringSettings) {
            throw new RuntimeException("No league lineage found for " + previousYearStr + " or " + yearStr);
        }

        return new LeagueSettings(previousYearScoringSettings, rosterSize);
    }

    private Map<String, PlayerIds> getPlayerIds() throws IOException, InterruptedException {
        // Fetching the player list from Sleeper is kind of slow. Keep a local cached copy
        // to speed things up.

        // If this changes, update .gitignore
        var playerListPath = Paths.get("sleeper_player_list.json");

        boolean getList = true;

        var playerListFile = playerListPath.toFile();
        if (playerListFile.exists()) {
            var lastUpdated = Instant.ofEpochMilli(playerListFile.lastModified());
            var maxAge = Instant.now().minus(1, ChronoUnit.DAYS);
            getList = lastUpdated.isBefore(maxAge);
        }

        Map<String, PlayerIds> playerIdsMap;
        if (getList) {
            var uri = URI.create("https://api.sleeper.app/v1/players/nfl");
            var request = HttpRequest.newBuilder().uri(uri).build();
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            var body = response.body();
            Files.writeString(playerListPath, body);
            playerIdsMap = OBJECT_MAPPER.readValue(body, new TypeReference<>() {});
        } else {
            playerIdsMap = OBJECT_MAPPER.readValue(playerListFile, new TypeReference<>() {});
        }
        return playerIdsMap;
    }

    private List<SleeperPlayerStats> getPlayerStats() throws IOException, InterruptedException {
        int previousYear = year - 1;
        var uri = URI.create("https://api.sleeper.com/stats/nfl/" + previousYear
                + "?season_type=regular&position[]=DEF&position[]=K&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_2qb");
        var request = HttpRequest.newBuilder(uri).build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        checkResponse(response, "Failed to retrieve status for season " + previousYear + ".");
        return OBJECT_MAPPER.readValue(response.body(), new TypeReference<>() {});
    }

    private <T> HttpResponse<T> checkResponse(HttpResponse<T> response, String description) {
        if (response.statusCode() >= 400) {
            throw new RuntimeException(description + " Status code: " + response.statusCode()
                    + ".\n==== Start Body ===\n" + response.body() + "\n=== End Body ===");
        }
        return response;
    }

    private String graphqlRequest(String query, String failureDescription) throws Exception {
        var uri = URI.create("https://api.sleeper.app/graphql");
        var request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("Authorization", jwt)
                .method("POST", HttpRequest.BodyPublishers.ofString(query))
                .build();
        // System.out.println("Request: " + request + ", query:\n" + query);
        var response = checkResponse(client.send(request, HttpResponse.BodyHandlers.ofString()), failureDescription);
        return response.body();
    }
}
