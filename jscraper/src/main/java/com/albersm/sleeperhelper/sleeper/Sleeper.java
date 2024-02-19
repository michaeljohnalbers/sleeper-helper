package com.albersm.sleeperhelper.sleeper;

import com.albersm.sleeperhelper.sleeper.model.Initialize;
import com.albersm.sleeperhelper.sleeper.model.PlayerIds;
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
import java.util.Map;

import static com.albersm.sleeperhelper.Scraper.OBJECT_MAPPER;

public class Sleeper {

    private final HttpClient client = HttpClient.newHttpClient();
    private final String jwt;
    private final int year;

    public Sleeper(String jwt, int year) throws Exception {
        this.jwt = jwt;
        this.year = year;

        var playerIds = getPlayerIds();
        var leagueIds = getLeagueIds();
        System.out.println("League Ids: " + leagueIds);
    }


    private record LeagueIds(String leagueId, String previousLeagueId){}

    private LeagueIds getLeagueIds() throws Exception {
        String query = """
{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app {
  my_leagues(exclude_archived: false) {
    league_id
    name
    previous_league_id
    season
    status
  }
}"
}""";
        // TODO: getting a 400
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

    /*
        pub fn get_league_ids(&self) -> Result<(String, Option<String>), Box<dyn Error>> {
        // This API call can be seen when loading the app (just https://sleeper.com) the first time, or after a refresh.
        let query = r#"{
  "operationName": "initialize_app",
  "variables":{},
  "query":"query initialize_app { my_leagues(exclude_archived: false) {league_id name previous_league_id season status} }"
}"#;

        let response =
            self.graphql_request(query.to_string(), "Failed to retrieve league details.")?;

        let initialize: Initialize = response.json::<Initialize>()?;

        for league in initialize.data.my_leagues.iter() {
            if league.name == "core.fantasy.football.league"
                && league.season == self.year.to_string()
            {
                return Ok((league.league_id.clone(), league.previous_league_id.clone()));
            }
        }

        Err(Box::new(GeneralError::from_string(format!(
            "Could not find league id for {}",
            self.year
        ))))
    }
     */

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

    private <T> HttpResponse<T> checkResponse(HttpResponse<T> response, String description) {
        if (response.statusCode() >= 400) {
            throw new RuntimeException(description + " Status code: " + response.statusCode()
                    + ". Body: " + response.body());
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
                .header("X-Sleeper-GraphQL-Op", "initialize_app")
                .method("Post", HttpRequest.BodyPublishers.ofString(query))
                .build();
        var response = checkResponse(client.send(request, HttpResponse.BodyHandlers.ofString()), failureDescription);
        return response.body();
    }
}
