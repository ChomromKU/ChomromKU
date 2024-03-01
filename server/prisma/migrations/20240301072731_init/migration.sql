-- CreateTable
CREATE TABLE `clubs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `category` ENUM('UnitOfActivitiesSupport', 'UnitOfStudentOrganization', 'UnitOfActivitiesForCharityAndAcademic', 'UnitOfCulturalAndSportsActivities', 'UnitOFCurriculumAndSpecialPrograms') NOT NULL,
    `branch` ENUM('Bangkhen', 'Sriracha', 'KamphaengSaen', 'SakonNakorn') NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clubs_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clubId` INTEGER NOT NULL,
    `facebook` VARCHAR(255) NOT NULL,
    `instagram` VARCHAR(255) NOT NULL,
    `twitter` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `social_media_clubId_key`(`clubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('NORMAL_POST', 'QA', 'NEWS') NOT NULL,
    `content` TEXT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `clubId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,

    INDEX `posts_clubId_idx`(`clubId`),
    INDEX `posts_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `status` ENUM('WAITING', 'OPEN', 'IN_PROGRESS', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `clubId` INTEGER NOT NULL,
    `ownerId` INTEGER NOT NULL,

    INDEX `events_clubId_idx`(`clubId`),
    INDEX `events_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stdId` VARCHAR(191) NOT NULL,
    `titleTh` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `firstNameTh` VARCHAR(191) NOT NULL,
    `lastNameTh` VARCHAR(191) NOT NULL,
    `firstNameEn` VARCHAR(191) NOT NULL,
    `lastNameEn` VARCHAR(191) NOT NULL,
    `campusNameTh` VARCHAR(191) NOT NULL,
    `campusNameEn` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_stdId_key`(`stdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('PRESIDENT', 'VICE_PRESIDENT', 'ADMIN', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
    `userId` INTEGER NOT NULL,
    `clubId` INTEGER NOT NULL,

    UNIQUE INDEX `members_userId_key`(`userId`),
    INDEX `members_clubId_idx`(`clubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NULL,
    `eventId` INTEGER NULL,

    INDEX `comments_userId_idx`(`userId`),
    INDEX `comments_postId_idx`(`postId`),
    INDEX `comments_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NULL,
    `eventId` INTEGER NULL,

    INDEX `likes_userId_idx`(`userId`),
    INDEX `likes_postId_idx`(`postId`),
    INDEX `likes_eventId_idx`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ClubToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ClubToUser_AB_unique`(`A`, `B`),
    INDEX `_ClubToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EventToUser` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EventToUser_AB_unique`(`A`, `B`),
    INDEX `_EventToUser_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
