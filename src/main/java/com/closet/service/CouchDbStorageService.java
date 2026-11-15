package com.closet.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CouchDbStorageService {

    private final RestClient restClient;
    private final String dbName;

    public CouchDbStorageService(
        RestClient restClient,
        @Value("${couchdb.db-name:closet_db}") String dbName) {
        this.restClient = restClient;
        this.dbName = dbName;
    }

    /**
     * 1. Creates or updates a JSON document in CouchDB.
     * Returns a Map containing the 'id' and current 'rev'.
     */
    public Map<?, ?> saveDocument(String docId, Map<String, Object> documentBody) {
        return restClient.put()
                .uri("/{db}/{id}", dbName, docId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(documentBody)
                .retrieve()
                .body(Map.class);
    }

    /**
     * 2. Uploads a photo binary directly to the CouchDB document.
     * CouchDB requires the latest document revision (_rev).
     */
    public Map<?, ?> uploadImageAttachment(String docId, String rev, MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg";
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        return restClient.put()
                .uri("/{db}/{id}/{filename}?rev={rev}", dbName, docId, fileName, rev)
                .contentType(MediaType.parseMediaType(contentType))
                .body(file.getBytes())
                .retrieve()
                .body(Map.class);
    }

    /**
     * Helper to construct the direct public/browser URL for an attached photo.
     */
    public String getImageUrl(String docId, String fileName) {
        return String.format("%s/%s/%s/%s", "http://127.0.0.1:5984", dbName, docId, fileName);
    }

    public byte[] getImageAttachment(String docId, String fileName) {
    return restClient.get()
            .uri("/{db}/{id}/{filename}", dbName, docId, fileName)
            .retrieve()
            .body(byte[].class);
    }
}