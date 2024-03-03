package com.albersm.sleeperhelper.model;

import java.util.List;

public record Season(Cap cap, Metadata metadata, List<Team> teams, int rosterSize) {
}
