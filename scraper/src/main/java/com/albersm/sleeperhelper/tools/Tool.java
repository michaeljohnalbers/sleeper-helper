package com.albersm.sleeperhelper.tools;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public interface Tool {
  /**
   * Generate the JSON data string for this tool
   * @param objectMapper JSON serializer
   * @return JSON string
   */
  String generateJson(ObjectMapper objectMapper) throws JsonProcessingException;
}
