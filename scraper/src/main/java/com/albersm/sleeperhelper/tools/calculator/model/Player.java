package com.albersm.sleeperhelper.tools.calculator.model;

import java.util.Map;

public record Player(String name, String position, String team, Map<String, Number> stats) {
}
