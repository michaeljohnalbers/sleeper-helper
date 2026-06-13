package com.albersm.sleeperhelper.tools.calculator;

import com.albersm.sleeperhelper.sleeper.Sleeper;
import com.albersm.sleeperhelper.tools.Tool;
import com.albersm.sleeperhelper.tools.calculator.model.Calculator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ScoringCalculator implements Tool {
  private final Sleeper sleeper;
  private final Calculator calculator;

  public ScoringCalculator(Sleeper sleeper) throws Exception {
    this.sleeper = sleeper;
    this.calculator = getData();
  }

  private Calculator getData() throws Exception {
    var scoringSettings = sleeper.getScoringSettings();
    return new Calculator(scoringSettings, null);
  }

  @Override
  public String generateJson(ObjectMapper objectMapper) throws JsonProcessingException {
    return objectMapper.writeValueAsString(calculator);
  }
}
