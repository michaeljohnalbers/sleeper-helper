package com.albersm.sleeperhelper.model;

import java.util.Map;

public record Player(boolean active, int draftRoundCost, boolean kept, String name, String position, String team,
                     int totalPoints, Map<String, Object> stats) {
}
