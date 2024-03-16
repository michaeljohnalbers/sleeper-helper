package com.albersm.sleeperhelper.sleeper.model;

import java.util.Map;

public record PlayerDetails(boolean active, String name, String position, int pointsScored, String team, int yahooId,
                            Map<Integer, CalculatedGameStats> gameStats) {

    public String toStringMinimal() {
        return "name=" + name() + ", position=" + position() + ", team=" + team() + ", yahooId=" + yahooId();
    }
}
