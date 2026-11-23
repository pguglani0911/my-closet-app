package com.closet.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CouchDbStorageService {

    private static final Logger log = LoggerFactory.getLogger(CouchDbStorageService.class);

    private final RestClient restClient;
    private final String dbName;

    public CouchDbStorageService(
        RestClient restClient,
        @Value("${couchdb.db-name:closet_db}") String dbName) {
        this.restClient = restClient;
        this.dbName = dbName;
    }

    /**
     * Logs exactly what CouchDB said when a call fails: the HTTP status and body for
     * an error response, or a connection message if CouchDB could not be reached.
     */
    private void logCouchFailure(String action, RuntimeException e) {
        if (e instanceof RestClientResponseException r) {
            log.error("CouchDB {} failed: HTTP {} - {}", action, r.getStatusCode().value(), r.getResponseBodyAsString());
        } else if (e instanceof ResourceAccessException) {
            log.error("CouchDB {} failed: cannot reach CouchDB - {}", action, e.getMessage());
        } else {
            log.error("CouchDB {} failed: {}", action, e.toString());
        }
    }

    /**
     * Runs once at startup. CouchDB does not create databases on its own, so this
     * creates closet_db if it is missing and logs a clear message if CouchDB is
     * unreachable or the credentials are rejected.
     */
    @PostConstruct
    void ensureDatabaseExists() {
        try {
            restClient.put()
                    .uri("/{db}", dbName)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .toBodilessEntity();
            log.info("CouchDB database '{}' was missing and has been created.", dbName);
        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            if (status == 412) {
                log.info("CouchDB database '{}' is ready.", dbName);
            } else if (status == 401 || status == 403) {
                log.error("CouchDB rejected the credentials (HTTP {}). Check couchdb.username / couchdb.password.", status);
            } else {
                log.error("CouchDB returned HTTP {} while checking database '{}': {}", status, dbName, e.getResponseBodyAsString());
            }
        } catch (ResourceAccessException e) {
            log.error("Cannot reach CouchDB at the configured couchdb.url. Is it running? {}", e.getMessage());
        }
    }

    /**
     * 1. Creates or updates a JSON document in CouchDB.
     * Returns a Map containing the 'id' and current 'rev'.
     */
    public Map<?, ?> saveDocument(String docId, Map<String, Object> documentBody) {
        try {
            return restClient.put()
                    .uri("/{db}/{id}", dbName, docId)
                    // CouchDB replies with text/plain unless the client asks for JSON,
                    // which would stop Spring from parsing the response into a Map.
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(documentBody)
                    .retrieve()
                    .body(Map.class);
        } catch (RuntimeException e) {
            logCouchFailure("saveDocument(" + docId + ")", e);
            throw e;
        }
    }

    /**
     * 2. Uploads a photo binary directly to the CouchDB document.
     * CouchDB requires the latest document revision (_rev).
     */
    public Map<?, ?> uploadImageAttachment(String docId, String rev, MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg";
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        try {
            return restClient.put()
                    .uri("/{db}/{id}/{filename}?rev={rev}", dbName, docId, fileName, rev)
                    .accept(MediaType.APPLICATION_JSON)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(file.getBytes())
                    .retrieve()
                    .body(Map.class);
        } catch (RuntimeException e) {
            logCouchFailure("uploadImageAttachment(" + docId + ", file='" + fileName + "', type=" + contentType + ")", e);
            throw e;
        }
    }

    /**
     * Helper to construct the direct public/browser URL for an attached photo.
     */
    public String getImageUrl(String docId, String fileName) {
        return String.format("%s/%s/%s/%s", "http://127.0.0.1:5984", dbName, docId, fileName);
    }

    public byte[] getImageAttachment(String docId, String fileName) {
        try {
            return restClient.get()
                    .uri("/{db}/{id}/{filename}", dbName, docId, fileName)
                    .retrieve()
                    .body(byte[].class);
        } catch (RuntimeException e) {
            logCouchFailure("getImageAttachment(" + docId + "/" + fileName + ")", e);
            throw e;
        }
    }
}