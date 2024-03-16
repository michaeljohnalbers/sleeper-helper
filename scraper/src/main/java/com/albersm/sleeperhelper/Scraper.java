package com.albersm.sleeperhelper;

import com.albersm.sleeperhelper.fantasypros.FantasyPros;
import com.albersm.sleeperhelper.fantasypros.model.PlayerRank;
import com.albersm.sleeperhelper.fantasypros.model.Rankings;
import com.albersm.sleeperhelper.model.*;
import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.albersm.sleeperhelper.sleeper.model.CalculatedGameStats;
import com.albersm.sleeperhelper.sleeper.model.PlayerDetails;
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
    public static void main(String[] args) throws Exception {
        new Scraper(args);
    }

    private static final Map<Integer, Cap> CAP = Map.of(
            2022, new Cap(1300),
            2023, new Cap(1200),
            2024, new Cap(1200)  // Not final
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
        if (args.length != 2) {
            printHelp();
            System.exit(1);
        }

        var jwt = args[0];
        var apiKey = args[1];

        var now = LocalDateTime.now();
        var year = now.getYear();

        var fantasyProsData = new FantasyPros(apiKey, year).getRankings();
        var sleeperData = new Sleeper(jwt, year);

        Metadata leagueMetadata = new Metadata(now.toString(), fantasyProsData.superflexRankings().lastUpdated(),
                "", PLAYER_STATS_KEYS);

        Season season = new Season(CAP.get(year), leagueMetadata, new LinkedList<>(), sleeperData.getRosterSize());

        int leagueSize = sleeperData.getRosterDetails().size();
        for (var roster : sleeperData.getRosterDetails()) {
            Owner owner = new Owner(roster.owner());
            Team team = new Team(owner, new LinkedList<>());
            season.teams().add(team);

            for (var playerDetails : roster.players()) {
                var fantasyProsPlayerData = getFantasyProsData(fantasyProsData, playerDetails, leagueSize,
                        sleeperData.getRosterSize());

                Player player = new Player(playerDetails.active(), fantasyProsPlayerData.draftRoundCost(), false,
                        playerDetails.name(), playerDetails.position(), playerDetails.team(),
                        playerDetails.pointsScored(), new HashMap<>());

                calculatePlayerGameStats(playerDetails.gameStats(), player.stats());
                player.stats().put(FPPR, fantasyProsPlayerData.positionRank());
                player.stats().put(FPOR, fantasyProsPlayerData.overallRank());

                team.players().add(player);
            }
        }

        Map<String, Season> seasons = new HashMap<>();
        seasons.put(Integer.toString(year), season);
        var json = OBJECT_MAPPER.writeValueAsString(seasons);
        System.out.println(json);
    }

    private record FantasyProsPlayerData(int draftRoundCost, String positionRank, int overallRank){}

    private FantasyProsPlayerData getFantasyProsData(Rankings playerRankings, PlayerDetails playerDetails,
                                                     int numberOfTeams, int rosterSize) {
        final int MAX_RANK = 9999;
        int finalPlayerRank = MAX_RANK;
        String positionRank = "N/A";
        int overallRank = MAX_RANK;

        for (int ii = 0; ii < playerRankings.superflexRankings().players().size(); ++ii) {
            var playerRank = playerRankings.superflexRankings().players().get(ii);
            if (isValidString(playerRank.playerYahooId())) {
                if (playerDetails.yahooId() == Integer.parseInt(playerRank.playerYahooId())) {
                    finalPlayerRank = playerRank.rankEcr();
                    overallRank = playerRank.rankEcr();
                    positionRank = playerRank.posRank();
                    break;
                }
            }

            if (playerProbablyEqual(playerRank, playerDetails)) {
                finalPlayerRank = playerRank.rankEcr();
                overallRank = playerRank.rankEcr();
                positionRank = playerRank.posRank();
            }
        }

        // Fantasy Pros doesn't include K or DEF in their superflex rankings. But we still want some
        // round cost for them. So as a compromise these positions will use overall rankings. There
        // shouldn't be too much impact to this as these positions aren't valued and will likely
        // end up costing last/last round picks.
        if (MAX_RANK == finalPlayerRank) {
            for (int ii = 0; ii < playerRankings.overallRankings().players().size(); ++ii) {
                var playerRank = playerRankings.overallRankings().players().get(ii);
                if (isValidString(playerRank.playerYahooId())) {
                    if (playerDetails.yahooId() == Integer.parseInt(playerRank.playerYahooId())) {
                        finalPlayerRank = playerRank.rankEcr();
                        break;
                    }
                }

                if (playerProbablyEqual(playerRank, playerDetails)) {
                    finalPlayerRank = playerRank.rankEcr();
                    overallRank = playerRank.rankEcr();
                    positionRank = playerRank.posRank();
                }
            }
        }

        // Fantasy Pros just doesn't have rankings for some players. When this was being
        // developed initially (2023), neither Tom Brady (newly retired) nor Jarrett Stidham (no clue why)
        // had rankings.
        if (MAX_RANK == finalPlayerRank) {
            System.err.println("WARNING: No ranking found for " + playerDetails.toStringMinimal());
            return new FantasyProsPlayerData(rosterSize, positionRank, overallRank);
        }

        float finalRankAsFloat = (float) finalPlayerRank;
        float numberOfTeamsAsFloat = (float) numberOfTeams;
        int roundCost = (int) Math.ceil(finalRankAsFloat / numberOfTeamsAsFloat);
        if (roundCost > rosterSize) {
            roundCost = rosterSize;
        }
        return new FantasyProsPlayerData(roundCost, positionRank, overallRank);
    }

    private static boolean isValidString(String str) {
        return str != null && !str.isBlank();
    }

    /**
     * Fantasy Pros uses the full name of a player ("Patrick Mahomes II") whereas Sleeper
     * doesn't bother with any suffixes ("Patrick Mahomes").
     * Fantasy Pros used "DST" whereas Sleeper used "DEF".
     */
    private boolean playerProbablyEqual(PlayerRank playerRank, PlayerDetails playerDetails) {
        return playerRank.playerName().contains(playerDetails.name()) &&
                (playerRank.playerPositionId().equals(playerDetails.position()) ||
                        (playerDetails.position().equals("DEF") && playerRank.playerPositionId().equals("DST")));
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
