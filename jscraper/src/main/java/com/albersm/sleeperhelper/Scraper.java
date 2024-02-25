package com.albersm.sleeperhelper;

import com.albersm.sleeperhelper.fantasypros.FantasyPros;
import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalField;

public class Scraper {

    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    public static void main(String[] args) throws Exception {
        new Scraper(args);
    }

    private Scraper(String[] args) throws Exception {
        if (args.length != 2) {
            printHelp();
            System.exit(1);
        }

        var jwt = args[0];
        var apiKey = args[1];

        var now = LocalDateTime.now();
        var year = now.getYear();

        year = 2023; // TODO: remove

        var fantasyProsData = new FantasyPros(apiKey, year).getRankings();
        var sleeperData = new Sleeper(jwt, year);
    }

    private void printHelp() {
        var help = """
        usage: java -jar [jar file] [Sleeper JWT] [FantasyPros API Key]
          No Sleeper JWT or FantasyPros API Key supplied");
          To get the Sleeper JWT, open https://sleeper.com, filter network traffic for 'graphql' then grab Authorization
            header value.";
          To get the Fantasy Pros API Key, open https://fantasypros.com, go to NFL rankings, select non-default scoring or
            position value, filter network traffic for 'consensus' then grab x-api-key header value.";
        """;
        System.err.println(help);
    }
}
