CREATE TABLE IF NOT EXISTS `captions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `image_id` BIGINT UNSIGNED NOT NULL,
  `dateadded` DATETIME NULL DEFAULT NULL,
  `caption` VARCHAR(225) NOT NULL,
  `status` ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
  `notes` VARCHAR(225) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_captions_image_id` (`image_id`),
  KEY `idx_captions_status` (`status`),
  CONSTRAINT `fk_captions_image_id`
    FOREIGN KEY (`image_id`)
    REFERENCES `images` (`ImageId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;