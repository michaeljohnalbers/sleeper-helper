package com.albersm.sleeperhelper.sleeper;

import static com.albersm.sleeperhelper.Scraper.OBJECT_MAPPER;
import static com.albersm.sleeperhelper.util.HttpUtils.checkResponse;

import com.albersm.sleeperhelper.sleeper.model.*;
import com.albersm.sleeperhelper.util.CacheableRequest;
import com.albersm.sleeperhelper.util.ThrottlingCacheableRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Period;
import java.util.*;

public class Sleeper {
  private static final String UNKNOWN = "UNKNOWN";
  private static final String NA = "N/A";
  private final HttpClient client = HttpClient.newHttpClient();
  private final String jwt;
  private final List<RosterDetails> rosterDetails = new ArrayList<>();
  private final int year;
  private final LeagueIds leagueIds;

  public Sleeper(String jwt, int year) throws Exception {
    this.jwt = jwt;
    this.year = year;

    this.leagueIds = getLeagueIds();
  }

  public int getYear() {
    return year;
  }

  public List<RosterDetails> getRosterDetails() {
    return rosterDetails;
  }

  private boolean isActive(String status) {
    return null != status && status.compareToIgnoreCase("active") == 0;
  }

  private record LeagueIds(String currentLeagueId, String previousLeagueId) {}

  /**
   * This API call can be seen when loading the app (just https://sleeper.com) the first time, or
   * after a refresh.
   */
  private LeagueIds getLeagueIds() throws Exception {
    String query =
"""
{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app { my_leagues(exclude_archived: false) {league_id name previous_league_id season status} }"
}""";

    var json = graphqlRequest(query, "Failed to retrieve league details.");

    var initialize = OBJECT_MAPPER.readValue(json, Initialize.class);

    for (var league : initialize.data().myLeagues()) {
      if ("core.fantasy.football.league".equals(league.name())
          && league.season().equals(Integer.toString(year))) {
        return new LeagueIds(league.leagueId(), league.previousLeagueId());
      }
    }

    throw new RuntimeException("Could not find league ID for " + year);
  }

  /** This API call can be seen when loading the initial league page at sleeper.com. */
  private SleeperLeagueDetails getLeagueDetails(String leagueId) throws Exception {
    String prefix =
"""
{
  "operationName": "get_league_detail",
  "variables":{},
  "query":"query get_league_detail { league_rosters(league_id: \\\"""";

    String middle = "\\\"){owner_id player_map} league_users(league_id: \\\"";
    String end =
"""
\\"){display_name user_id} }"
}""";

    String query = prefix + leagueId + middle + leagueId + end;

    var json =
        graphqlRequest(query, "Failed to retrieve league details for league " + leagueId + ".");

    return OBJECT_MAPPER.readValue(json, SleeperLeagueDetails.class);
  }

  public SleeperLeagueDetails getCurrentLeagueDetails() throws Exception {
    return getLeagueDetails(leagueIds.currentLeagueId());
  }

  public SleeperLeagueDetails getPreviousLeagueDetails() throws Exception {
    return getLeagueDetails(leagueIds.previousLeagueId());
  }

  /** This API call can be seen when loading the initial league page at sleeper.com. */
  public Map<String, Float> getScoringSettings() throws Exception {
    String prefix =
"""
{
  "operationName": "metadata",
  "variables":{},
  "query":"query metadata {metadata(type: \\"league_history\\", key: \\\"""";

    String end =
"""
\\"){ data }}"
}""";

    String query = prefix + leagueIds.currentLeagueId() + end;
    var json = graphqlRequest(query, "Failed to retrieve league metadata.");

    String yearStr = Integer.toString(year);

    Map<String, Float> scoringSettings = null;

    var leagueMetadata = OBJECT_MAPPER.readValue(json, Metadata.class);
    for (var lineage : leagueMetadata.data().metadata().data().lineage()) {
      if (lineage.season().equals(yearStr)) {
        scoringSettings = lineage.scoringSettings();
      }
    }

    if (null == scoringSettings) {
      throw new RuntimeException("No league lineage found for " + yearStr);
    }

    return scoringSettings;
  }

  public Map<Integer, GameStats> getPlayerGameStats(String playerId, int year)
      throws IOException, InterruptedException {

    var uri =
        URI.create(
            "https://api.sleeper.com/stats/nfl/player/"
                + playerId
                + "?season_type=regular&season="
                + year
                + "&grouping=week");
    String cacheFile = "gameStats" + playerId + ".json";
    String description =
        "Failed to retrieve player game stats for player Id '"
            + playerId
            + "' for season "
            + year
            + ".";
    var jacksonType = new TypeReference<Map<Integer, GameStats>>() {};
    var r =
        new ThrottlingCacheableRequest<>(
            client, uri, cacheFile, description, jacksonType, Period.ofDays(30));
    return r.getResponse();
  }

  private Map<String, PlayerIds> getPlayerIds() throws IOException, InterruptedException {
    // Fetching the player list from Sleeper is kind of slow. Keep a local cached copy
    // to speed things up.

    var uri = URI.create("https://api.sleeper.app/v1/players/nfl");
    String cacheFile = "sleeper_player_list.json";
    String description = "Failed to retrieve player list.";
    var jacksonType = new TypeReference<Map<String, PlayerIds>>() {};
    var r =
        new CacheableRequest<Map<String, PlayerIds>>(
            client, uri, cacheFile, description, jacksonType);
    return r.getResponse();
  }

  private List<SleeperPlayerStats> getPlayerStats() throws IOException, InterruptedException {
    int previousYear = year - 1;
    var uri =
        URI.create(
            "https://api.sleeper.com/stats/nfl/"
                + previousYear
                + "?season_type=regular&position[]=DEF&position[]=K&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_2qb");
    var request = HttpRequest.newBuilder(uri).build();
    var response = client.send(request, HttpResponse.BodyHandlers.ofString());
    checkResponse(response, "Failed to retrieve status for season " + previousYear + ".");
    return OBJECT_MAPPER.readValue(response.body(), new TypeReference<>() {});
  }

  private String graphqlRequest(String query, String failureDescription) throws Exception {
    var uri = URI.create("https://sleeper.com/graphql");
    var request =
        HttpRequest.newBuilder()
            .uri(uri)
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
            .header("Authorization", jwt)
            .method("POST", HttpRequest.BodyPublishers.ofString(query))
            .build();
    // System.out.println("Request: " + request + ", query:\n" + query);
    var response =
        checkResponse(
            client.send(request, HttpResponse.BodyHandlers.ofString()), failureDescription);
    return response.body();
  }
}
