package com.albersm.sleeperhelper.tools.calculator.model;

import java.util.Map;

public record Calculator(Map<String, Float> leagueScoringSettings, Map<String, Player> players) {}
