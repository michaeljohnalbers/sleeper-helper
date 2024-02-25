package com.albersm.sleeperhelper.sleeper.model;

import java.util.List;

public record SleeperLeagueDetailsData(List<SleeperLeagueRoster> leagueRosters, List<SleeperLeagueUser> leagueUsers) {
}
