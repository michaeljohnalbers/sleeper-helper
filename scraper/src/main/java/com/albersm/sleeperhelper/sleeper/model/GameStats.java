package com.albersm.sleeperhelper.sleeper.model;

import java.util.Map;

public record GameStats(Map<String, Float> stats, int week) {
}
