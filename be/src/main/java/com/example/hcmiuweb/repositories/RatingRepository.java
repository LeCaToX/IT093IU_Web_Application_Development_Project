package com.example.hcmiuweb.repositories;

import com.example.hcmiuweb.entities.VideoRating;
import com.example.hcmiuweb.entities.VideoRatingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<VideoRating, VideoRatingId> {
    List<VideoRating> findByVideo_Id(Long videoId);
}