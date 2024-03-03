package com.albersm.sleeperhelper.sleeper.model;

import java.util.Map;

public record SleeperPlayerStats(String playerId, Map<String, Float> stats) {
}
