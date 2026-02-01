package org.example.backend.service;

import org.example.backend.Model.Asset;
import org.example.backend.Model.AssetHistory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class MarketApiService {

    private final RestTemplate restTemplate;

    @Value("${flask.api.base-url}")
    private String flaskBaseUrl;

    public MarketApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Asset getQuote(String symbol) {
        String url = flaskBaseUrl + "/api/market/quote/" + symbol;
        return restTemplate.getForObject(url, Asset.class);
    }

    public List<AssetHistory> getHistory(String symbol) {
        String url = flaskBaseUrl + "/api/market/history/" + symbol;

        ResponseEntity<List<AssetHistory>> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<List<AssetHistory>>() {}
                );

        return response.getBody();
    }
}

