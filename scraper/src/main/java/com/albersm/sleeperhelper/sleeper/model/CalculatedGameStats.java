package com.albersm.sleeperhelper.sleeper.model;

import java.util.Map;

public record CalculatedGameStats(Map<String, Float> stats, int week, float totalPoints) {}
