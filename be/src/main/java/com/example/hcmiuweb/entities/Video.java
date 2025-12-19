package com.example.hcmiuweb.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "Video")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "video_id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime uploadDate;
    private Integer duration; // in seconds

    @Column(nullable = false)
    private String url;

    @Column
    private String thumbnailUrl;

    @Column
    private Long viewCount = 0L;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User uploader;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VideoRating> ratings = new HashSet<>();

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<VideoTag> tags = new HashSet<>();

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "relatedVideo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    // Constructors
    public Video() {
    }

    public Video(String title, String description, LocalDateTime uploadDate, Integer duration, String url,
            String thumbnailUrl, User uploader, Category category) {
        this.title = title;
        this.description = description;
        this.uploadDate = uploadDate;
        this.duration = duration;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.uploader = uploader;
        this.category = category;
        this.viewCount = 0L;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public User getUploader() {
        return uploader;
    }

    public void setUploader(User uploader) {
        this.uploader = uploader;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public Set<VideoRating> getRatings() {
        return ratings;
    }

    public void setRatings(Set<VideoRating> ratings) {
        this.ratings = ratings;
    }

    // Add helper methods
    public void addRating(VideoRating rating) {
        ratings.add(rating);
        rating.setVideo(this);
    }

    public void removeRating(VideoRating rating) {
        ratings.remove(rating);
        rating.setVideo(null);
    }

    public void addTag(VideoTag tag) {
        tags.add(tag);
        tag.setVideo(this);
    }

    public void removeTag(VideoTag tag) {
        tags.remove(tag);
        tag.setVideo(null);
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setVideo(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setVideo(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Video video = (Video) o;
        return id != null && id.equals(video.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
