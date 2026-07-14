package com.closet.entity;

import com.closet.exception.LocalDateStringConverter;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.math.RoundingMode;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin; 
import jakarta.persistence.Column;


@Entity
@Table(name = "wardrobe")
public class ClothingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "material")
    private String material;

    // Default to 0
    @Column(name = "wear_frequency", nullable = false)
    private Integer wearFrequency = 0;

    @Convert(converter = LocalDateStringConverter.class)
    @Column(name = "last_worn")
    private LocalDate lastWorn;

    @NotNull(message = "Cost cannot be null")
    @DecimalMin(value = "0.00", message = "Cost cannot be negative") // Changed from @Min to @DecimalMin
    @Column(name = "cost", nullable = false, columnDefinition = "REAL CHECK (cost >= 0.00)")
    private Double cost = 0.00;

    

    // Default to false. Hibernate maps boolean to INTEGER (0 or 1) in SQLite seamlessly.
    @Column(name = "to_go", nullable = false)
    private Boolean toGo = false;

    // Automatically captures the current system date on insertion
    @Convert(converter = LocalDateStringConverter.class)
    @Column(name = "added", nullable = false, updatable = false)
    private LocalDate added;

    @Column(name = "clothing_type")
    private String clothingType;

    private Boolean forSale = false;

    @Column(name = "username") // Avoid using the SQL reserved keyword 'user' as a column name
    private String user;

    private Double sellingPrice;
    private String size;

    // --- JPA Lifecycle Hook ---
    @PrePersist
    protected void onCreate() {
        // Automatically sets the date to "now" right before it hits the database
        this.added = LocalDate.now();
    }




    

   
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    
    public Integer getWearFrequency() { return wearFrequency; }
    public void setWearFrequency(Integer wearFrequency) { this.wearFrequency = wearFrequency; }
    
    public LocalDate getLastWorn() { return lastWorn; }
    public void setLastWorn(LocalDate lastWorn) { this.lastWorn = lastWorn; }
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        public Double getCost() {
        return this.cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
    
    public Boolean getToGo() { return toGo; }
    public void setToGo(Boolean toGo) { this.toGo = toGo; }
    
    public LocalDate getAdded() { return added; }
    public void setAdded(LocalDate added) { this.added = added; }
    
    public String getClothingType() { return clothingType; }
    public void setClothingType(String clothingType) { this.clothingType = clothingType; }


    public boolean isForSale() { return forSale != null && forSale;}
    public void setForSale(boolean forSale) { this.forSale = forSale; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public Double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }



    @JsonProperty("itemValue")
    public String getFormattedItemValue() {
        if (this.cost == null || this.cost == 0.0) return "0.00";
        int frequency = (this.wearFrequency == null || this.wearFrequency == 0) ? 1 : this.wearFrequency;
        double rawValue = this.cost / frequency;
    
        return BigDecimal.valueOf(rawValue)
                        .setScale(2, RoundingMode.HALF_UP)
                        .toString();
    }



    @JsonProperty("cost") // Forces Jackson to name this key "cost" in the final JSON output
    public String getFormattedCost() {
        if (this.cost == null) return "0.00";
    
    // Pure Truncation (Chops off trailing numbers to stay 8.99 like in your screenshot)
        return BigDecimal.valueOf(this.cost)
                     .setScale(2, RoundingMode.HALF_UP)
                     .toString();
    }



    @OneToMany(mappedBy = "clothingItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<WardrobeTag> tags = new ArrayList<>();

    // --- Helper Method to Link Tags Cleanly ---
    public void addTag(String tagText) {
        WardrobeTag newTag = new WardrobeTag(tagText, this);
        this.tags.add(newTag);
    }

    // --- Getter and Setter ---
    public List<WardrobeTag> getTags() { return tags; }
    public void setTags(List<WardrobeTag> tags) { this.tags = tags; }

}