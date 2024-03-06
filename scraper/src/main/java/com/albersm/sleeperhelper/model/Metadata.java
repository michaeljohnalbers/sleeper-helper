package com.albersm.sleeperhelper.model;

import java.util.Map;

public record Metadata(String playerDataPullDate, String playerRankingsGenDate, String notes,
                       Map<String, String> playerStatsKeys) {
}
