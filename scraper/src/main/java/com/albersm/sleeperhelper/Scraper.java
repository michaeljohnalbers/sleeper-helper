package com.albersm.sleeperhelper;

import com.albersm.sleeperhelper.model.*;
import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.albersm.sleeperhelper.tools.calculator.ScoringCalculator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;

public class Scraper {

    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);

    static void main(String[] args) throws Exception {
        new Scraper(args);
    }

    private Scraper(String[] args) throws Exception {
        if (args.length != 1) {
            printHelp();
            System.exit(1);
        }

        var sleeperJwt = args[0];

        var now = LocalDateTime.now();
        var year = now.getYear();

        var sleeper = new Sleeper(sleeperJwt, year);

        System.out.println("Generating data for scoring calculator...");
        var scoringCalculator = new ScoringCalculator(sleeper);
        var scoringCalculatorJson = scoringCalculator.generateJson(OBJECT_MAPPER);

        var path = Path.of("scoring-calculator.json");
        Files.writeString(path, scoringCalculatorJson);
        System.out.println("  Scoring calculator data written to " + path);
    }

    private void printHelp() {
        var help = """
        usage: java -jar [jar file] [Sleeper JWT]
          No Sleeper JWT supplied");
          To get the Sleeper JWT, open https://sleeper.com, filter network traffic for 'graphql' then grab Authorization
            header value.";
        """;
        System.err.println(help);
    }
}
