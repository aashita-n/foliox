package org.example.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImmunityAnalysisService {

    private final RestTemplate restTemplate;

    public ImmunityAnalysisService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<?> analyzeImmunity(List<Map<String, Object>> assets) {
        // Prepare the body to be sent to Flask API
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("assets", assets);

        // Flask API URL
        String flaskApiUrl = "http://127.0.0.1:5000/api/immune/analyze";

        // Send the POST request to Flask API
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    flaskApiUrl,
                    requestBody,
                    String.class
            );

            // Return the response from Flask API
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error contacting Flask API: " + e.getMessage());
        }
    }
}

