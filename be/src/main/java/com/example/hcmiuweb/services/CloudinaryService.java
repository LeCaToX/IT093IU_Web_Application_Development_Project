package com.example.hcmiuweb.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload an image to Cloudinary and return the URL
     * 
     * @param file   The image file to upload
     * @param folder The folder to store the image in Cloudinary (e.g., "avatars",
     *               "videos")
     * @return Map containing upload results, including "secure_url" for the image
     *         URL
     * @throws IOException If the upload fails
     */
    public Map uploadImage(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "auto"));
    }

    /**
     * Delete an image from Cloudinary
     * 
     * @param publicId The public ID of the image to delete
     * @return Map containing deletion results
     * @throws IOException If the deletion fails
     */
    public Map deleteImage(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}