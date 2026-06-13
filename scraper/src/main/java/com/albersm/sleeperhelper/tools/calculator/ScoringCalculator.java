package com.albersm.sleeperhelper.tools.calculator;

import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.albersm.sleeperhelper.sleeper.model.GameStats;
import com.albersm.sleeperhelper.tools.Tool;
import com.albersm.sleeperhelper.tools.calculator.model.Main;
import com.albersm.sleeperhelper.tools.calculator.model.Player;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class ScoringCalculator implements Tool {
  private final Sleeper sleeper;
  private final Main main;

  public ScoringCalculator(Sleeper sleeper) throws Exception {
    this.sleeper = sleeper;
    this.main = getData();
  }

  private Main getData() throws Exception {
    var scoringSettings = sleeper.getScoringSettings();

    var previousLeagueDetails = sleeper.getPreviousLeagueDetails();

    Map<String, Player> allRosteredPlayers = new HashMap<>();
    for (var roster : previousLeagueDetails.data().leagueRosters()) {
      for (var playerEntry : roster.playerMap().values()) {
        var gameStats = sleeper.getPlayerGameStats(playerEntry.playerId(), sleeper.getYear() - 1);
        var seasonStats = calculateSeasonStats(gameStats);
        var player = new Player(playerEntry.firstName() + " " + playerEntry.lastName(),
            playerEntry.position(),
            playerEntry.team(),
            seasonStats);

        allRosteredPlayers.put(playerEntry.playerId(), player);
      }
    }

    return new Main(scoringSettings, allRosteredPlayers);
  }

  @Override
  public String generateJson(ObjectMapper objectMapper) throws JsonProcessingException {
    return objectMapper.writeValueAsString(main);
  }

  private Map<String, Float> calculateSeasonStats(Map<Integer, GameStats> playerStats) {
    Map<String, Float> seasonStats = new HashMap<>();
    playerStats.values().stream()
        // Game stats are null if the player didn't play that week.
        .filter(Objects::nonNull)
        .flatMap((gameStats -> gameStats.stats().entrySet().stream()))
        .forEach(
            stat ->
                seasonStats.compute(
                    stat.getKey(),
                    (k, v) -> {
                      if (null == v) {
                        return stat.getValue();
                      }
                      /* Some stats aren't just counters, but actual
                      statistics, like averages. This doesn't work for those, but we
                      don't use any of those in our scoring. */
                      return v + stat.getValue();
                    }));
    return seasonStats;
  }
}
