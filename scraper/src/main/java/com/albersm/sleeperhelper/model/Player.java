package com.albersm.sleeperhelper.model;

public record Player(boolean active, int draftRoundCost, boolean kept, String name, String position, String team,
                     int totalPoints) {
}
