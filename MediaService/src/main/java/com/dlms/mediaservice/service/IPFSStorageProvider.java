package com.dlms.mediaservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;

import java.io.IOException;

@Service
public class IPFSStorageProvider implements StorageProvider {

    @Value("${pinata.api.key}")
    private String pinataApiKey;

    @Value("${pinata.secret.api.key}")
    private String pinataSecretApiKey;

    private final String PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    private final String GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        // Prepare Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("pinata_api_key", pinataApiKey);
        headers.set("pinata_secret_api_key", pinataSecretApiKey);

        // Prepare Body
        // Prepare Body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        // FIX: Use ByteArrayResource to ensure filename is passed correctly to Pinata
        body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        // Create Request
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // Send POST Request using RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(PINATA_UPLOAD_URL, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("IpfsHash");
            } else {
                throw new IOException("Failed to upload to Pinata: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new IOException("Error communicating with Pinata API", e);
        }
    }

    @Override
    public String getAccessUrl(String cid) {
        return GATEWAY_URL + cid;
    }
}
