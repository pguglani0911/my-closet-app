package com.closet.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.closet.entity.ClothingItem;
import com.closet.repository.ClothingItemRepository;
import com.closet.service.CouchDbStorageService;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "http://localhost:3000")
public class UploadWardrobeItemController {

    private static final Logger log = LoggerFactory.getLogger(UploadWardrobeItemController.class);

    private final CouchDbStorageService couchService;
    private final ClothingItemRepository itemRepository;


    public UploadWardrobeItemController(CouchDbStorageService couchService, ClothingItemRepository itemRepository) {
        this.couchService = couchService;
        this.itemRepository = itemRepository;
    }

    public void validateAttachmentRules(MultipartFile file) {
        String filename = file != null ? file.getOriginalFilename() : null;
        String contentType = file != null ? file.getContentType() : null;
        long fileSize = file != null ? file.getSize() : 0;
        long maxBytes = 5 * 1024 * 1024; // 5 MB limit

        if (file.isEmpty() || fileSize == 0) {
            throw new IllegalArgumentException("Error: File cannot be null or empty.");
        } else if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Error: Attachment filename cannot be empty or whitespace-only.");
        } else if (filename.startsWith("_")) {
            throw new IllegalArgumentException("Error: Attachment name cannot start with an underscore (_).");
        } else if (filename.matches(".*[\\x00-\\x1F\\x7F].*")) {
            throw new IllegalArgumentException("Error: Filename contains invalid control characters or null bytes.");
        } else if (contentType == null || 
                (!contentType.equals("image/jpeg") && 
                !contentType.equals("image/png") && 
                !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Error: Missing or unsupported Content-Type MIME type.");
        } else if (fileSize > maxBytes) {
            throw new IllegalArgumentException("Error: Attachment exceeds the maximum allowed size of 5 MB.");
        } else {
            log.info("Validation passed for attachment: " + filename);
        }
    }



    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createItemWithPhoto(
            @RequestParam("itemName") String itemName,
            @RequestParam(value = "clothingType", required = false) String clothingType,
            @RequestParam(value = "material", required = false) String material,
            @RequestParam(value = "size", required = false) String size,
            @RequestParam(value = "cost", defaultValue = "0.00") Double cost,
            @RequestParam(value = "isForSale", defaultValue = "false") boolean isForSale,
            @RequestParam(value = "sellingPrice", required = false) Double sellingPrice,
            @RequestParam(value = "user", required = false) String user,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("image") MultipartFile image) throws IOException {






                

        log.info("[UPLOAD] Info Request received: itemName='{}', user='{}', file='{}' ({} bytes, {})",
                itemName, user, image.getOriginalFilename(), image.getSize(), image.getContentType());


        
        // Generate a unique ID for CouchDB
        String docId = "item_" + UUID.randomUUID().toString().substring(0, 8);

        
        

        // STEP 1: save the metadata document to CouchDB (returns the first _rev)
        String currentRev;
        try {
            Map<String, Object> couchData = new HashMap<>();
            couchData.put("type", "clothing_item");
            couchData.put("itemName", itemName);
            couchData.put("size", size);
            couchData.put("isForSale", isForSale);



            Map<?, ?> saveResult = couchService.saveDocument(docId, couchData);
            currentRev = (String) saveResult.get("rev");
            log.info("[UPLOAD] STEP 1 OK: CouchDB document {} created (rev {})", docId, currentRev);
        } catch (RuntimeException e) {
            log.error("[UPLOAD] STEP 1 FAILED: could not save CouchDB document {}", docId, e);
            throw e;
        }

        // STEP 2: upload the image binary as an attachment on that document
        try {
            validateAttachmentRules(image);
            couchService.uploadImageAttachment(docId, currentRev, image);
            log.info("[UPLOAD] STEP 2 OK: image attached to CouchDB document {}", docId);
        } catch(IllegalArgumentException e) {
             log.error("[UPLOAD] STEP 2 FAILED: Illegal argument error message", docId, e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
           
        }catch (IOException | RuntimeException e) {
            log.error("[UPLOAD] STEP 2 FAILED: could not attach image to CouchDB document {}", docId, e);
            throw e;
        }
        

        // Determine the filename and construct the proxy URL
        String filename = image.getOriginalFilename() != null ? image.getOriginalFilename() : "photo.jpg";
       String proxyImageUrl = "http://localhost:8080/api/items/images/" + docId + "/" + filename;

        // STEP 3: save the SQLite row (this is where a foreign key or column problem would show up)
        ClothingItem savedItem;
        try {
            ClothingItem item = new ClothingItem();
            item.setItemName(itemName);
            item.setClothingType(clothingType);
            item.setMaterial(material);
            item.setSize(size);
            item.setCost(cost);
            item.setForSale(isForSale);
            item.setSellingPrice(sellingPrice);
            item.setUser(user);
            item.setCouchDocId(docId);
            item.setImageUrl(proxyImageUrl);

            savedItem = itemRepository.save(item);
            log.info("[UPLOAD] STEP 3 OK: SQLite row {} saved", savedItem.getId());
        } catch (RuntimeException e) {
            log.error("[UPLOAD] STEP 3 FAILED: SQLite insert failed (user='{}'). CouchDB document {} was already created and is now orphaned.",
                    user, docId, e);
            throw e;
        }

        // Return combined response
        Map<String, Object> response = new HashMap<>();
        response.put("sqlId", savedItem.getId());
        response.put("couchDocId", savedItem.getCouchDocId());
        response.put("itemName", savedItem.getItemName());
        response.put("imageUrl", savedItem.getImageUrl());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/images/{docId}/{filename}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable("docId") String docId,
            @PathVariable("filename") String filename) {
        try {
            byte[] imageBytes = couchService.getImageAttachment(docId, filename);

            // Simple content-type detection based on file extension
            MediaType mediaType = MediaType.IMAGE_JPEG;
            if (filename.toLowerCase().endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (filename.toLowerCase().endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageBytes);
        } catch (Exception e) {
            log.warn("[IMAGE] Could not load {}/{}: {}", docId, filename, e.toString());
            return ResponseEntity.notFound().build();
        }
    }
}