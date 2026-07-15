package com.closet.service;

import com.closet.entity.ClothingItem;
import com.closet.repository.WardrobeRepository;
import com.closet.entity.WardrobeTag;


import com.closet.exception.*; 
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import org.springframework.data.domain.Sort;

@Service
public class WardrobeService {

    private final WardrobeRepository wardrobeRepository;

    public WardrobeService(WardrobeRepository wardrobeRepository) {
        this.wardrobeRepository = wardrobeRepository;
    }

    public List<ClothingItem> getTaggedWardrobe(String tag) {
        List<ClothingItem> items = wardrobeRepository.findTaggedWardrobe(tag);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Sorry! You don't have anything with the tag '" + tag + "' in your closet!");
        }
        return items;
    }

    public List<ClothingItem> getItems() {
        List<ClothingItem> items = wardrobeRepository.findAll();
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Sorry! You don't have anything in your closet!");
        }
        return items;
    }

    public List<ClothingItem> getItemsByType(String type) {
        List<ClothingItem> items = wardrobeRepository.findByClothingTypeIgnoreCase(type);
        if (items.isEmpty()) {
            throw new ResourceNotFoundException("Sorry! You don't have anything with the type '" + type + "' in your closet!");
        }
        return items;
    }

    public ClothingItem addItem(ClothingItem newItem) {
        if (newItem.getTags() != null) {
            for (WardrobeTag tag : newItem.getTags()) {
                tag.setClothingItem(newItem); // Establishes the relationship for Hibernate
            }
        }
        return wardrobeRepository.save(newItem);
    }
    @Transactional
    public void deleteItem(Long id) {
        if (!wardrobeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sorry! This item does not exist in your closet!");
        }
        wardrobeRepository.deleteById(id);
    }

    public ClothingItem markToGo(Long id) {
        ClothingItem item = wardrobeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sorry! Clothing item not found with id: " + id));
        
        item.setToGo(true); 
        return wardrobeRepository.save(item);
    }

    public ClothingItem markNotToGo(Long id) {
        ClothingItem item = wardrobeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sorry! Clothing item not found with id: " + id));
        
        item.setToGo(false); 
        return wardrobeRepository.save(item);
    }

    public ClothingItem wearItem(Long id) {
    ClothingItem item = wardrobeRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Sorry! Clothing item not found with id: " + id));
    
        item.setWearFrequency(item.getWearFrequency() + 1); 
        item.setLastWorn(java.time.LocalDate.now());
        return wardrobeRepository.save(item);

    }


    @Transactional
    public ClothingItem updateItem(Long id, ClothingItem updatedDetails) {
        // 1. Fetch the existing item or throw your custom exception if it doesn't exist
        ClothingItem existingItem = wardrobeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sorry! Can't update because this item does not exist in your closet!"));

        // 2. Dynamically check and update basic fields if they are provided
        if (updatedDetails.getClothingType() != null) {
            existingItem.setClothingType(updatedDetails.getClothingType());
        }
        if (updatedDetails.getWearFrequency() != null) {
            existingItem.setWearFrequency(updatedDetails.getWearFrequency());
        }
        if (updatedDetails.getToGo() != null) {
            existingItem.setToGo(updatedDetails.getToGo());
        }
        if (updatedDetails.getLastWorn() != null) {
            existingItem.setLastWorn(updatedDetails.getLastWorn());
        }
        if (updatedDetails.getCost() != null) {
            existingItem.setCost(updatedDetails.getCost());
        }
        if (updatedDetails.getMaterial() != null) {
            existingItem.setMaterial(updatedDetails.getMaterial());
        }
        
        // 3. Handle complex child associations safely (Tags)
        if (updatedDetails.getTags() != null) {
            // Clear old tags to prevent orphans, then establish the new relationships
            existingItem.getTags().clear();
            for (WardrobeTag tag : updatedDetails.getTags()) {
                tag.setClothingItem(existingItem);
                existingItem.getTags().add(tag);
            }
        }

        // 4. Save the modified managed entity back to SQLite
        return wardrobeRepository.save(existingItem);
    }




    public List<ClothingItem> getAllItemsSorted(String sortBy, String direction) {
        // 1. Fallback defaults if parameters are empty
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "id"; // Default sort by database ID
        }
        if (direction == null || direction.trim().isEmpty()) {
            direction = "asc";
        }

        // 2. Validate field names to match your Entity property names exactly
        // Note: Make sure these match the variable names in your ClothingItem class!
        switch (sortBy) {
            case "cost":
            case "lastWorn":
            case "added":
            case "toGo":
            case "id":
                break; // Valid field, allow execution
            default:
                throw new InvalidTypeException("Cannot sort by '" + sortBy + "'. Valid fields are cost, lastWorn, added, or togo.");
        }

        // 3. Determine the direction rule
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

        // 4. Create the dynamic Sort configuration object
        Sort sortOrder = Sort.by(sortDirection, sortBy);

        // 5. Pass the sort settings directly to Spring Data's built-in findAll method
        return wardrobeRepository.findAll(sortOrder);
    }


    public List<ClothingItem> getMarketplaceItems() {
        return wardrobeRepository.findByForSaleTrue();
    }




    public ClothingItem toggleSaleStatus(Long id, Double price, String size, String username) {
        ClothingItem item = wardrobeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
        
        // Toggle the sale status
        boolean currentStatus = item.isForSale();
        item.setForSale(!currentStatus);
        
        if (item.isForSale()) {
            item.setSellingPrice(price);
            item.setSize(size);
            item.setUser(username);
        } else {
            // Optional: clean up listing values if pulling off the market
            item.setSellingPrice(null);
            item.setSize(null);
            item.setUser(null);
        }
        
        return wardrobeRepository.save(item);
    }
}