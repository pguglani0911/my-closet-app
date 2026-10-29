package com.closet.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
public class WardrobeItemController {

    private final CouchDbStorageService couchService;
    private final ClothingItemRepository itemRepository;

    public WardrobeItemController(CouchDbStorageService couchService, ClothingItemRepository itemRepository) {
        this.couchService = couchService;
        this.itemRepository = itemRepository;
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
        
        // 1. Generate a unique ID for CouchDB
        String docId = "item_" + UUID.randomUUID().toString().substring(0, 8);

        // 2. Prepare CouchDB JSON metadata document
        Map<String, Object> couchData = new HashMap<>();
        couchData.put("type", "clothing_item");
        couchData.put("itemName", itemName);
        couchData.put("size", size);
        couchData.put("isForSale", isForSale);

        // Save metadata to CouchDB to retrieve initial revision ID (_rev)
        Map<?, ?> saveResult = couchService.saveDocument(docId, couchData);
        String currentRev = (String) saveResult.get("rev");

        // Upload the image binary to CouchDB
        couchService.uploadImageAttachment(docId, currentRev, image);

        // 3. Determine the correct filename and construct the proxy URL
        String filename = image.getOriginalFilename() != null ? image.getOriginalFilename() : "photo.jpg";
        String proxyImageUrl = "http://localhost:8080/api/items/images/" + docId + "/" + filename;

        // 4. Populate and save the SQL Entity (including the permanent imageUrl)
        ClothingItem item = new ClothingItem();
        item.setItemName(itemName);
        item.setClothingType(clothingType);
        item.setMaterial(material);
        item.setSize(size);
        item.setCost(cost);
        item.setForSale(isForSale);
        item.setSellingPrice(sellingPrice);
        item.setUser(user);
        item.setCouchDocId(docId); // Foreign key reference to CouchDB
        item.setImageUrl(proxyImageUrl); // Persist proxy URL in SQLite

        ClothingItem savedItem = itemRepository.save(item);

        // 5. Return combined response
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
            return ResponseEntity.notFound().build();
        }
    }
}