package com.closet.controller;

import com.closet.entity.ClothingItem;
import com.closet.service.WardrobeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/wardrobe")
public class WardrobeController {

    private final WardrobeService wardrobeService;

    public WardrobeController(WardrobeService wardrobeService) {
        this.wardrobeService = wardrobeService;
    }

    @GetMapping
    public ResponseEntity<?> getAll(
        @RequestParam(required = false, defaultValue = "id") String sortBy,
        @RequestParam(required = false, defaultValue = "asc") String direction) {
        List<ClothingItem> items = wardrobeService.getAllItemsSorted(sortBy, direction);
        if (items.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Sorry! You don't have any items in your closet!");
        }
        return ResponseEntity.ok(items);
    }

    @GetMapping("/sorted")
    public ResponseEntity<List<ClothingItem>> getItemsSorted(
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(wardrobeService.getAllItemsSorted(sortBy, direction));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ClothingItem>> getTaggedItems(@PathVariable String tag) {
        // wardrobeService.getTaggedWardrobe already throws ResourceNotFoundException on empty
        return ResponseEntity.ok(wardrobeService.getTaggedWardrobe(tag));
    }

    @GetMapping("/{type}")
    public ResponseEntity<List<ClothingItem>> getItemsByType(@PathVariable String type) {
        // wardrobeService.getItemsByType already throws ResourceNotFoundException on empty
        return ResponseEntity.ok(wardrobeService.getItemsByType(type));
    }

    @PostMapping
    public ResponseEntity<ClothingItem> addItem(@Valid @RequestBody ClothingItem newItem) {
        ClothingItem savedItem = wardrobeService.addItem(newItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        wardrobeService.deleteItem(id);
        return ResponseEntity.ok("Item with ID " + id + " was successfully deleted.");
    }

    @PutMapping("/{id}/markToGo")
    public ResponseEntity<ClothingItem> markToGo(@PathVariable Long id) {
        return ResponseEntity.ok(wardrobeService.markToGo(id));
    }

    @PutMapping("/{id}/markNotToGo")
    public ResponseEntity<ClothingItem> markNotToGo(@PathVariable Long id) {
        return ResponseEntity.ok(wardrobeService.markNotToGo(id));
    }

    @PutMapping("/{id}/wear")
    public ResponseEntity<ClothingItem> wear(@PathVariable Long id) {
        return ResponseEntity.ok(wardrobeService.wearItem(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClothingItem> updateItem(@PathVariable Long id, @Valid @RequestBody ClothingItem updatedDetails) {
        return ResponseEntity.ok(wardrobeService.updateItem(id, updatedDetails));
    }

    @GetMapping("/marketplace")
    public List<ClothingItem> getMarketplaceItems() {
        return wardrobeService.getMarketplaceItems();
    }

    @PutMapping("/{id}/toggleSale")
    public ClothingItem toggleForSale(@PathVariable Long id, @RequestBody ToggleSaleRequest request) {
        return wardrobeService.toggleSaleStatus(id, request.getPrice(), request.getSize(), request.getUser());
    }
}