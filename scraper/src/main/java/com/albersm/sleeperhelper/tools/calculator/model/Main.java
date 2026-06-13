package com.albersm.sleeperhelper.tools.calculator.model;

import java.util.Map;

/**
 * Top level object for JSON generation
 */
public record Main(Map<String, Float> leagueScoringSettings, Map<String, Player> players) {}
