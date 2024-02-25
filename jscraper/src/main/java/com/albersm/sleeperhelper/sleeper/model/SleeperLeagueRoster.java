package com.albersm.sleeperhelper.sleeper.model;

import java.util.Map;

public record SleeperLeagueRoster(String ownerId, Map<String, SleeperLeaguePlayer> playerMap) {
}
