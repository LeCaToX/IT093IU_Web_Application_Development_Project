package com.example.hcmiuweb.controllers;

import com.example.hcmiuweb.entities.User;
import com.example.hcmiuweb.payload.response.MessageResponse;
import com.example.hcmiuweb.services.CloudinaryService;
import com.example.hcmiuweb.services.UserDetailsImpl;
import com.example.hcmiuweb.services.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/uploads")
public class FileUploadController {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadController.class);

    private final CloudinaryService cloudinaryService;
    private final UserService userService;

    @Autowired
    public FileUploadController(CloudinaryService cloudinaryService, UserService userService) {
        this.cloudinaryService = cloudinaryService;
        this.userService = userService;
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            // Check if a specific user ID was provided
            Long targetUserId = userId;

            // If no user ID was provided, try to get the authenticated user
            if (targetUserId == null) {
                try {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        targetUserId = userDetails.getId();
                    }
                } catch (Exception e) {
                    logger.warn("No authentication context available: {}", e.getMessage());
                }
            }

            // If we still don't have a user ID, return an error
            if (targetUserId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse(
                        "No user ID provided and no authenticated user found. Please provide a user ID or authenticate."));
            }

            // Upload image to Cloudinary
            Map uploadResult = cloudinaryService.uploadImage(file, "avatars");
            String avatarUrl = (String) uploadResult.get("secure_url");

            // Update user with new avatar URL
            Optional<User> userOptional = userService.findUserById(targetUserId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setAvatar(avatarUrl);
                userService.updateUser(user);

                // Return response with the avatar URL
                Map<String, Object> response = new HashMap<>();
                response.put("avatarUrl", avatarUrl);
                response.put("message", "Avatar uploaded successfully");
                response.put("userId", targetUserId);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found with ID: " + targetUserId));
            }
        } catch (IOException e) {
            logger.error("Error uploading avatar: ", e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading avatar: " + e.getMessage()));
        }
    }

    @PostMapping("/avatar/{userId}")
    public ResponseEntity<?> uploadAvatarForUser(@RequestParam("file") MultipartFile file, @PathVariable Long userId) {
        try {
            // Check permissions when the user is authenticated
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                    Long authenticatedUserId = userDetails.getId();

                    // If user tries to upload avatar for someone else, check if they are admin
                    if (!authenticatedUserId.equals(userId)) {
                        boolean isAdmin = authentication.getAuthorities()
                                .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        if (!isAdmin) {
                            return ResponseEntity.status(403).body(
                                    new MessageResponse("You do not have permission to change another user's avatar."));
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("No authentication context available for permission check: {}", e.getMessage());
                // Continue anyway - in this version we allow unauthenticated uploads with
                // explicit userId
            }

            // Upload image to Cloudinary
            Map uploadResult = cloudinaryService.uploadImage(file, "avatars");
            String avatarUrl = (String) uploadResult.get("secure_url");

            // Update user with new avatar URL
            Optional<User> userOptional = userService.findUserById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setAvatar(avatarUrl);
                userService.updateUser(user);

                // Return response with the avatar URL
                Map<String, Object> response = new HashMap<>();
                response.put("avatarUrl", avatarUrl);
                response.put("userId", userId);
                response.put("message", "Avatar uploaded successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found with ID: " + userId));
            }
        } catch (IOException e) {
            logger.error("Error uploading avatar: ", e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading avatar: " + e.getMessage()));
        }
    }

    /**
     * Set avatar URL directly (for existing assets or external URLs)
     * This doesn't upload a file, just updates the user's avatar URL
     */
    @PostMapping("/avatar-url")
    public ResponseEntity<?> setAvatarUrl(@RequestBody Map<String, String> request) {
        try {
            String avatarUrl = request.get("avatarUrl");
            if (avatarUrl == null || avatarUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Avatar URL is required"));
            }

            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401).body(new MessageResponse("Authentication required"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();

            // Update user with new avatar URL
            Optional<User> userOptional = userService.findUserById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setAvatar(avatarUrl);
                userService.updateUser(user);

                Map<String, Object> response = new HashMap<>();
                response.put("avatarUrl", avatarUrl);
                response.put("userId", userId);
                response.put("message", "Avatar updated successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }
        } catch (Exception e) {
            logger.error("Error setting avatar URL: ", e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error setting avatar: " + e.getMessage()));
        }
    }

    /**
     * Upload a video file to Cloudinary
     * 
     * @param file The video file to upload
     * @return The Cloudinary URL of the uploaded video
     */
    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Only video files are allowed"));
            }

            // Check file size (limit to 100MB)
            long maxSize = 100 * 1024 * 1024; // 100MB in bytes
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest().body(new MessageResponse("Video file size must be less than 100MB"));
            }

            logger.info("Uploading video to Cloudinary: {} (size: {} bytes)", file.getOriginalFilename(),
                    file.getSize());

            // Upload video to Cloudinary
            Map uploadResult = cloudinaryService.uploadImage(file, "videos");
            String videoUrl = (String) uploadResult.get("secure_url");

            Map<String, Object> response = new HashMap<>();
            response.put("url", videoUrl);
            response.put("publicId", uploadResult.get("public_id"));
            response.put("message", "Video uploaded successfully");

            logger.info("Video uploaded successfully: {}", videoUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading video: ", e);
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading video: " + e.getMessage()));
        }
    }

    /**
     * Upload a thumbnail image to Cloudinary
     * 
     * @param file The image file to upload
     * @return The Cloudinary URL of the uploaded thumbnail
     */
    @PostMapping("/thumbnail")
    public ResponseEntity<?> uploadThumbnail(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Only image files are allowed"));
            }

            // Check file size (limit to 10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest().body(new MessageResponse("Image file size must be less than 10MB"));
            }

            logger.info("Uploading thumbnail to Cloudinary: {}", file.getOriginalFilename());

            // Upload thumbnail to Cloudinary
            Map uploadResult = cloudinaryService.uploadImage(file, "thumbnails");
            String thumbnailUrl = (String) uploadResult.get("secure_url");

            Map<String, Object> response = new HashMap<>();
            response.put("url", thumbnailUrl);
            response.put("publicId", uploadResult.get("public_id"));
            response.put("message", "Thumbnail uploaded successfully");

            logger.info("Thumbnail uploaded successfully: {}", thumbnailUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error uploading thumbnail: ", e);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error uploading thumbnail: " + e.getMessage()));
        }
    }
}