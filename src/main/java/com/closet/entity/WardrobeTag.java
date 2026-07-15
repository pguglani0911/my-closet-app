package com.closet.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "wardrobe_tags")
public class WardrobeTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @Column(name = "tag", nullable = false)
    private String tag; // e.g., "summer", "casual", "flowy"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wardrobe_id", nullable = false)
    @JsonBackReference // Prevents infinite recursion loop during JSON serialization
    private ClothingItem clothingItem;


    public WardrobeTag() {}

    public WardrobeTag(String tag, ClothingItem clothingItem) {
        this.tag = tag;
        this.clothingItem = clothingItem;
    }


    public Long getTagId() { return tagId; }
    public void setTagId(Long tagId) { this.tagId = tagId; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public ClothingItem getClothingItem() { return clothingItem; }
    public void setClothingItem(ClothingItem clothingItem) { this.clothingItem = clothingItem; }
}