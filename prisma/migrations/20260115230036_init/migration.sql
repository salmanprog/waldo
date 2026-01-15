-- CreateTable
CREATE TABLE `user_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `type` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `isSuperAdmin` BOOLEAN NOT NULL DEFAULT false,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NULL,
    `updatedAt` TIMESTAMP(6) NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `user_role_title_key`(`title`),
    UNIQUE INDEX `user_role_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserApiToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `api_token` VARCHAR(191) NOT NULL,
    `device_type` VARCHAR(191) NULL,
    `device_token` VARCHAR(191) NULL,
    `platform_type` VARCHAR(191) NULL,
    `platform_id` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `addressLine1` VARCHAR(255) NOT NULL,
    `addressLine2` VARCHAR(255) NULL,
    `city` VARCHAR(150) NOT NULL,
    `state` VARCHAR(150) NULL,
    `country` VARCHAR(150) NOT NULL,
    `postalCode` VARCHAR(50) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    INDEX `user_address_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userGroupId` INTEGER NULL,
    `createdBy` INTEGER NOT NULL DEFAULT 0,
    `userType` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `name` VARCHAR(255) NULL,
    `lname` VARCHAR(255) NULL,
    `username` VARCHAR(150) NOT NULL DEFAULT 'temp_username',
    `slug` VARCHAR(150) NOT NULL DEFAULT 'temp_slug',
    `email` VARCHAR(150) NULL,
    `mobileNumber` VARCHAR(150) NULL,
    `dob` VARCHAR(250) NULL,
    `age` INTEGER NOT NULL DEFAULT 0,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    `profileType` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    `password` VARCHAR(255) NOT NULL,
    `imageUrl` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `isEmailVerify` BOOLEAN NOT NULL DEFAULT false,
    `emailVerifyAt` DATETIME(3) NULL,
    `platformType` VARCHAR(191) NOT NULL DEFAULT 'custom',
    `platformId` VARCHAR(191) NULL,
    `emailOtp` VARCHAR(100) NULL,
    `emailOtpCreatedAt` DATETIME(3) NULL,
    `createdAt` TIMESTAMP(6) NULL,
    `updatedAt` TIMESTAMP(6) NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_slug_key`(`slug`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_mobileNumber_key`(`mobileNumber`),
    INDEX `User_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `imageUrl` TEXT NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `event_category_slug_key`(`slug`),
    INDEX `event_category_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `price` DOUBLE NULL DEFAULT 0,
    `is_manual` BOOLEAN NOT NULL DEFAULT true,
    `is_face` BOOLEAN NOT NULL DEFAULT true,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `Event_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_category_faqs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventCategoryId` INTEGER NOT NULL,
    `slug` VARCHAR(255) NULL,
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `event_category_faqs_slug_key`(`slug`),
    INDEX `event_category_faqs_eventCategoryId_idx`(`eventCategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `seoTitle` VARCHAR(255) NULL,
    `seoDescription` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `blog_slug_key`(`slug`),
    INDEX `blog_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `url` TEXT NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO', 'DOCUMENT') NOT NULL DEFAULT 'IMAGE',
    `relatedType` VARCHAR(100) NULL,
    `relatedId` INTEGER NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    INDEX `media_relatedType_relatedId_idx`(`relatedType`, `relatedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `stripeSessionId` VARCHAR(191) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_stripeSessionId_key`(`stripeSessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `itemslug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `eventCategoryId` INTEGER NULL,
    `eventId` INTEGER NULL,
    `title` VARCHAR(255) NULL,
    `imageUrl` TEXT NOT NULL,
    `description` TEXT NULL,
    `galleryPath` VARCHAR(255) NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `gallery_slug_key`(`slug`),
    INDEX `gallery_eventCategoryId_idx`(`eventCategoryId`),
    INDEX `gallery_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `galleryId` INTEGER NOT NULL,
    `title` VARCHAR(255) NULL,
    `imageUrl` TEXT NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` TIMESTAMP(6) NULL,

    UNIQUE INDEX `gallery_items_slug_key`(`slug`),
    INDEX `gallery_items_galleryId_idx`(`galleryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserApiToken` ADD CONSTRAINT `UserApiToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_address` ADD CONSTRAINT `user_address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userGroupId_fkey` FOREIGN KEY (`userGroupId`) REFERENCES `user_role`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `event_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_category_faqs` ADD CONSTRAINT `event_category_faqs_eventCategoryId_fkey` FOREIGN KEY (`eventCategoryId`) REFERENCES `event_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery` ADD CONSTRAINT `gallery_eventCategoryId_fkey` FOREIGN KEY (`eventCategoryId`) REFERENCES `event_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery` ADD CONSTRAINT `gallery_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_items` ADD CONSTRAINT `gallery_items_galleryId_fkey` FOREIGN KEY (`galleryId`) REFERENCES `gallery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
