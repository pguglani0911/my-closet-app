package com.closet.controller;

import com.closet.entity.ClothingItem;
import com.closet.service.WardrobeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;



@RestController
@RequestMapping("/api/wardrobe")
@CrossOrigin(origins = "http://localhost:3000")
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
        List<ClothingItem> sortedItems = wardrobeService.getAllItemsSorted(sortBy, direction);
        return ResponseEntity.ok(sortedItems);
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<?> getTaggedItems(@PathVariable String tag) {
    
        List<ClothingItem> items = wardrobeService.getTaggedWardrobe(tag);

        if (items.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Sorry! You don't have anything with this tag in your closet!");
        }
        
        return ResponseEntity.ok(items); 
    }


    @GetMapping("/{type}")
    public ResponseEntity<?> getItemsByType(@PathVariable String type) {

        List<ClothingItem> items = wardrobeService.getItemsByType(type);
        
        if (items.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Sorry! You don't have anything with this type in your closet!");
        }
        
        return ResponseEntity.ok(items);
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
        ClothingItem updatedItem = wardrobeService.markToGo(id);
        return ResponseEntity.ok(updatedItem);
    }

    @PutMapping("/{id}/markNotToGo")
    public ResponseEntity<ClothingItem> markNotToGo(@PathVariable Long id) {
        ClothingItem updatedItem = wardrobeService.markNotToGo(id);
        return ResponseEntity.ok(updatedItem);
    }

    @PutMapping("/{id}/wear")
    public ResponseEntity<ClothingItem> wear(@PathVariable Long id) {
        ClothingItem updatedItem = wardrobeService.wearItem(id);
        
        return ResponseEntity.ok(updatedItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClothingItem> updateItem(@PathVariable Long id, @RequestBody ClothingItem updatedDetails) {
        ClothingItem savedItem = wardrobeService.updateItem(id, updatedDetails);
        return ResponseEntity.ok(savedItem);
    }

        // Get all public marketplace listings
    @GetMapping("/marketplace")
    public List<ClothingItem> getMarketplaceItems() {
        return wardrobeService.getMarketplaceItems(); // Calls repository.findByForSaleTrue()
    }

    // Toggle an item listed for sale or returning to private closet
    @PutMapping("/{id}/toggleSale")
    public ClothingItem toggleForSale(@PathVariable Long id, @RequestParam(required = false) Double price, @RequestParam(required = false) String size, @RequestParam(required = false) String user) {
        return wardrobeService.toggleSaleStatus(id, price, size, user);
    }

        



    


    






}

    

    
