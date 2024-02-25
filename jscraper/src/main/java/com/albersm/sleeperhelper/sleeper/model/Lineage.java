package com.albersm.sleeperhelper.sleeper.model;

import java.util.List;
import java.util.Map;

public record Lineage(List<String> rosterPositions, String season, Map<String, Float> scoringSettings) {
}
