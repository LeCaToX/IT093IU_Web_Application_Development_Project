package com.example.hcmiuweb.components;

import com.example.hcmiuweb.entities.Category;
import com.example.hcmiuweb.entities.Role;
import com.example.hcmiuweb.entities.User;
import com.example.hcmiuweb.entities.Video;
import com.example.hcmiuweb.repositories.CategoryRepository;
import com.example.hcmiuweb.repositories.RoleRepository;
import com.example.hcmiuweb.repositories.UserRepository;
import com.example.hcmiuweb.repositories.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

        private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

        private final RoleRepository roleRepository;
        private final CategoryRepository categoryRepository;
        private final UserRepository userRepository;
        private final VideoRepository videoRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(RoleRepository roleRepository,
                        CategoryRepository categoryRepository,
                        UserRepository userRepository,
                        VideoRepository videoRepository,
                        PasswordEncoder passwordEncoder) {
                this.roleRepository = roleRepository;
                this.categoryRepository = categoryRepository;
                this.userRepository = userRepository;
                this.videoRepository = videoRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) {
                // Add default roles if none exist
                if (roleRepository.count() == 0) {
                        roleRepository.save(new Role("ROLE_USER"));
                        roleRepository.save(new Role("ROLE_ADMIN"));
                        logger.info("Default roles created");
                } else {
                        // Check for specific roles even if some roles exist
                        if (roleRepository.findByRoleName("ROLE_USER").isEmpty()) {
                                roleRepository.save(new Role("ROLE_USER"));
                                logger.info("Added missing ROLE_USER");
                        }
                        if (roleRepository.findByRoleName("ROLE_ADMIN").isEmpty()) {
                                roleRepository.save(new Role("ROLE_ADMIN"));
                                logger.info("Added missing ROLE_ADMIN");
                        }
                }

                // Initialize admin account if it doesn't exist
                if (!userRepository.existsByUsername("admin")) {
                        Role adminRole = roleRepository.findByRoleName("ROLE_ADMIN")
                                        .orElseThrow(() -> new RuntimeException("Admin role not found"));

                        User adminUser = new User(
                                        "admin",
                                        "admin@gmail.com",
                                        "12345678", // Using raw password, will be encoded below
                                        LocalDateTime.now(),
                                        "/resources/static/images/avatars/default-avatar.jpg",
                                        adminRole);

                        adminUser.setPassword(passwordEncoder.encode(adminUser.getPassword()));
                        userRepository.save(adminUser);
                        logger.info("Admin account created with username: admin");
                }

                if (categoryRepository.count() == 0) {
                        categoryRepository.save(new Category("Entertainment"));
                        categoryRepository.save(new Category("Education"));
                        categoryRepository.save(new Category("Technology"));
                        categoryRepository.save(new Category("Sports"));
                        categoryRepository.save(new Category("Music"));
                        logger.info("Default categories created");
                }

                // Always ensure sample videos exist (re-create if deleted)
                ensureSampleVideosExist();
        }

        private void ensureSampleVideosExist() {
                // Get the admin user as uploader
                Optional<User> adminUserOpt = userRepository.findByUsername("admin");
                if (adminUserOpt.isEmpty()) {
                        logger.warn("Admin user not found, skipping sample video initialization");
                        return;
                }
                User adminUser = adminUserOpt.get();

                // Get categories
                List<Category> categories = categoryRepository.findAll();
                if (categories.isEmpty()) {
                        logger.warn("No categories found, skipping sample video initialization");
                        return;
                }

                // Find categories by name
                Category entertainment = findCategoryByName(categories, "Entertainment");
                Category education = findCategoryByName(categories, "Education");
                Category technology = findCategoryByName(categories, "Technology");
                Category sports = findCategoryByName(categories, "Sports");
                Category music = findCategoryByName(categories, "Music");

                LocalDateTime now = LocalDateTime.now();
                int createdCount = 0;

                // Create sample videos using files from public/videos and public/assets
                // Video URL format: /videos/filename.mp4 (served by frontend)
                // Thumbnail URL format: /assets/filename.jpg (served by frontend)

                // Each video is only created if it doesn't already exist (checked by URL)

                if (createVideoIfNotExists("RoDynRF - Dynamic Neural Radiance Fields",
                                "Explore the cutting-edge research in dynamic neural radiance fields for 3D scene reconstruction.",
                                now.minusDays(10), 180, "/videos/RoDynRF.mp4", "/assets/RoDynRF.jpg", adminUser,
                                technology)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("A Lot - Music Video",
                                "Enjoy this amazing music video featuring incredible visuals and beats.",
                                now.minusDays(9), 240, "/videos/alot.mp4", "/assets/alot.jpg", adminUser, music)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Backpropagation Explained",
                                "Learn how backpropagation works in neural networks - the foundation of deep learning.",
                                now.minusDays(8), 300, "/videos/backprop.mp4", "/assets/backprop.jpg", adminUser,
                                education)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Chelsea Champions League Highlights",
                                "Watch the best moments from Chelsea's Champions League campaign.",
                                now.minusDays(7), 420, "/videos/chelseac3.mp4", "/assets/chelsea.png", adminUser,
                                sports)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Chim Sau - Vietnamese Music",
                                "Beautiful Vietnamese music video with stunning cinematography.",
                                now.minusDays(6), 210, "/videos/chimsau.mp4", "/assets/chimsau.png", adminUser,
                                music)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Clan - Epic Gaming Moments",
                                "The most epic gaming clan moments compilation.",
                                now.minusDays(5), 360, "/videos/clan.mp4", "/assets/clan.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("CSM - Chainsaw Man",
                                "Chainsaw Man anime highlights and best scenes.",
                                now.minusDays(4), 280, "/videos/csm.mp4", "/assets/video.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Doraemon Classic Episodes",
                                "Relive the classic Doraemon adventures with Nobita and friends.",
                                now.minusDays(3), 600, "/videos/doraemon.mp4", "/assets/doraemon.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("El Clasico - Real Madrid vs Barcelona",
                                "The greatest rivalry in football - watch the best El Clasico moments.",
                                now.minusDays(2), 720, "/videos/elclasico.mp4", "/assets/elclasico.jpg", adminUser,
                                sports)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Word Embeddings Tutorial",
                                "Understanding word embeddings in NLP - from Word2Vec to modern transformers.",
                                now.minusDays(1), 360, "/videos/embeddings.mp4", "/assets/embedding.jpg", adminUser,
                                education)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Love Is - Romantic Music",
                                "A beautiful collection of romantic songs and melodies.",
                                now, 300, "/videos/loveis.mp4", "/assets/loveis.jpg", adminUser, music)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Mission Impossible - Best Action Scenes",
                                "The most thrilling action scenes from the Mission Impossible franchise.",
                                now.minusHours(12), 240, "/videos/mission_impossible.mp4",
                                "/assets/mission_impossible.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Manchester United vs Tottenham Highlights",
                                "Premier League classic: Manchester United takes on Tottenham Hotspur.",
                                now.minusHours(6), 300, "/videos/mu_spurs.mp4", "/assets/mu_spurs.jpg", adminUser,
                                sports)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("One Piece - Epic Moments",
                                "The most epic moments from the legendary One Piece anime series.",
                                now.minusHours(3), 480, "/videos/one_piece.mp4", "/assets/onepiece.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Predator - Movie Highlights",
                                "Iconic scenes from the Predator movie franchise.",
                                now.minusHours(2), 320, "/videos/predator.mp4", "/assets/predator.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createVideoIfNotExists("Solo Leveling - Anime Highlights",
                                "Experience the rise of Sung Jin-Woo in this Solo Leveling highlight reel.",
                                now.minusHours(1), 540, "/videos/sololeveling.mp4", "/assets/video.jpg", adminUser,
                                entertainment)) {
                        createdCount++;
                }

                if (createdCount > 0) {
                        logger.info("Created {} missing sample videos", createdCount);
                } else {
                        logger.info("All sample videos already exist");
                }
        }

        private Category findCategoryByName(List<Category> categories, String name) {
                return categories.stream()
                                .filter(c -> c.getName().equalsIgnoreCase(name))
                                .findFirst()
                                .orElse(categories.get(0)); // Fallback to first category
        }

        /**
         * Creates a video only if it doesn't already exist (checked by URL)
         * 
         * @return true if video was created, false if it already existed
         */
        private boolean createVideoIfNotExists(String title, String description, LocalDateTime uploadDate,
                        Integer duration, String url, String thumbnailUrl,
                        User uploader, Category category) {
                if (videoRepository.existsByUrl(url)) {
                        return false; // Video already exists
                }
                Video video = new Video(title, description, uploadDate, duration, url, thumbnailUrl, uploader,
                                category);
                videoRepository.save(video);
                return true;
        }
}
