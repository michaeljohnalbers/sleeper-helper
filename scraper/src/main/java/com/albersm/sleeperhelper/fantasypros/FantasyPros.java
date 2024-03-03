package com.albersm.sleeperhelper.fantasypros;

import com.albersm.sleeperhelper.fantasypros.model.PlayerRankings;
import com.albersm.sleeperhelper.fantasypros.model.Rankings;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static com.albersm.sleeperhelper.Scraper.OBJECT_MAPPER;

public class FantasyPros {

    private final Rankings rankings;
    private final HttpClient client = HttpClient.newHttpClient();

    public FantasyPros(String apiKey, int year) throws IOException, InterruptedException {
        var overallRankings = getRankings(apiKey, year, "ALL");
        var superFlexRankings = getRankings(apiKey, year, "OP");
        this.rankings = new Rankings(overallRankings, superFlexRankings);
    }

    public Rankings getRankings() {
        return rankings;
    }

    private PlayerRankings getRankings(String apikey, int year, String position) throws IOException, InterruptedException {
        var url = "https://api.fantasypros.com/v2/json/nfl/" + year
                + "/consensus-rankings?type=draft&scoring=PPR&position=" + position
                + "&week=0&experts=available";

        var uri  = URI.create(url);

        var request = HttpRequest.newBuilder()
                .uri(uri)
                .header("Accept", "application/json")
                .header("x-api-key", apikey)
                .build();

        var response = client.send(request, HttpResponse.BodyHandlers.ofString());

        var body = response.body();

        return OBJECT_MAPPER.readValue(body, PlayerRankings.class);
    }
}
