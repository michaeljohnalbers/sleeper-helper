package com.albersm.sleeperhelper.sleeper.model;

import java.util.List;

public record Roster(String owner, String ownerId, List<Player> players) {
}
