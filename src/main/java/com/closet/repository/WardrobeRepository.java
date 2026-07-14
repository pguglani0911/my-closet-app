package com.closet.repository;

import com.closet.entity.ClothingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface WardrobeRepository extends JpaRepository<ClothingItem, Long> {

    @Query(value = "SELECT wardrobe.* FROM wardrobe " +
                   "JOIN wardrobe_tags ON wardrobe.id = wardrobe_tags.wardrobe_id " +
                   "WHERE wardrobe_tags.tag = :tag", 
           nativeQuery = true)
    List<ClothingItem> findTaggedWardrobe(@Param("tag") String tag);

    List<ClothingItem> findByForSaleTrue();
    
    

    List<ClothingItem> findByClothingTypeIgnoreCase(String clothingType);
}