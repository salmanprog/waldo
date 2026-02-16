/*
  Warnings:

  - Made the column `slug` on table `coffe_table_book` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `coffe_table_book` MODIFY `slug` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `favourite_images_coffe_book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `gallery_image_id` INTEGER NOT NULL,
    `gallery_image_path` TEXT NOT NULL,

    INDEX `favourite_images_coffe_book_userId_idx`(`userId`),
    INDEX `favourite_images_coffe_book_gallery_image_id_idx`(`gallery_image_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favourite_images_coffe_book` ADD CONSTRAINT `favourite_images_coffe_book_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favourite_images_coffe_book` ADD CONSTRAINT `favourite_images_coffe_book_gallery_image_id_fkey` FOREIGN KEY (`gallery_image_id`) REFERENCES `gallery_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
