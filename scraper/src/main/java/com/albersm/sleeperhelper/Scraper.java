package com.albersm.sleeperhelper;

import com.albersm.sleeperhelper.model.*;
import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.albersm.sleeperhelper.sleeper.model.CalculatedGameStats;
import com.albersm.sleeperhelper.tools.calculator.ScoringCalculator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.apache.commons.math3.stat.descriptive.rank.Median;

import java.time.LocalDateTime;
import java.util.*;

public class Scraper {

    public static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    static void main(String[] args) throws Exception {
        new Scraper(args);
    }

    private static final Map<Integer, Cap> CAP = Map.of(
            2022, new Cap(1300),
            2023, new Cap(1200),
            2024, new Cap(1200)
    );

    private static final String ASGP = "asgp";
    private static final String FPPR = "fppr";
    private static final String FPOR = "fpor";
    private static final String GP = "gp";
    private static final String MDSGP = "mdsgp";
    private static final String MNSGP = "mnsgp";
    private static final String MXSGP = "mxsgp";
    /**
     * Map a shorter string to the full stat name. This is only to save space in the JSON output by
     * eliminating some redundant strings.
     */
    private static final Map<String, String> PLAYER_STATS_KEYS = Map.of(
            FPPR, "Fantasy Pros Position Rank",
            FPOR, "Fantasy Pros Overall Rank",
            GP, "Games Played",
            MXSGP, "Max Single Game Points",
            MNSGP, "Min Single Game Points",
            MDSGP, "Median Single Game Points",
            ASGP, "Avg Single Game Points"
    );

    private Scraper(String[] args) throws Exception {
        if (args.length != 1) {
            printHelp();
            System.exit(1);
        }

        var sleeperJwt = args[0];

        var now = LocalDateTime.now();
        var year = now.getYear();

        var sleeper = new Sleeper(sleeperJwt, year);

        var calculator = new ScoringCalculator(sleeper);
        System.out.println("Scoring settings:\n" + calculator.generateJson(OBJECT_MAPPER));

//        Metadata leagueMetadata = new Metadata(now.toString(), null, "", PLAYER_STATS_KEYS);
//
//        Season season = new Season(CAP.get(year), leagueMetadata, new LinkedList<>(), 0);
//
//        int leagueSize = sleeper.getRosterDetails().size();
//        for (var roster : sleeper.getRosterDetails()) {
//            Owner owner = new Owner(roster.owner());
//            Team team = new Team(owner, new LinkedList<>());
//            season.teams().add(team);
//
//            for (var playerDetails : roster.players()) {
//                Player player = new Player(playerDetails.active(), 0, false,
//                        playerDetails.name(), playerDetails.position(), playerDetails.team(),
//                        playerDetails.pointsScored(), new HashMap<>());
//
//                calculatePlayerGameStats(playerDetails.gameStats(), player.stats());
//
//                team.players().add(player);
//            }
//        }
//
//        Map<String, Season> seasons = new HashMap<>();
//        seasons.put(Integer.toString(year), season);
//        var json = OBJECT_MAPPER.writeValueAsString(seasons);
//        System.out.println(json);
    }

    private void calculatePlayerGameStats(Map<Integer, CalculatedGameStats> playerGameStats, Map<String, Object> stats) {
        DescriptiveStatistics descriptiveStatistics = new DescriptiveStatistics();
        for (var entry : playerGameStats.entrySet()) {
            var gameStats = entry.getValue();
            if (gameStats != null) {
                 Float gpFloat = gameStats.stats().get("gp");
                 if (gpFloat != null && gpFloat.intValue() == 1) {
                     descriptiveStatistics.addValue(gameStats.totalPoints());
                 }
            }
        }

        stats.put(ASGP, twoDecimals(descriptiveStatistics.getMean()));
        stats.put(GP, descriptiveStatistics.getN());
        stats.put(MNSGP, twoDecimals(descriptiveStatistics.getMin()));
        stats.put(MXSGP, twoDecimals(descriptiveStatistics.getMax()));
        Median median = new Median();
        stats.put(MDSGP, twoDecimals(median.evaluate(descriptiveStatistics.getSortedValues())));
    }

    private float twoDecimals(double f) {
        return Math.round(f * 100.0f) / 100.0f;
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
