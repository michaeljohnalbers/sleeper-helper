package com.albersm.sleeperhelper.sleeper.model;

import java.util.List;

public record RosterDetails(String owner, String ownerId, List<PlayerDetails> players) {
}
