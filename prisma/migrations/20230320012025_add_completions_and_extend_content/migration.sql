-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Chat` MODIFY `first_message` TEXT NULL;

-- AlterTable
ALTER TABLE `Message` MODIFY `content` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Completion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `completion_id` VARCHAR(191) NOT NULL,
    `date` INTEGER NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `finish_reason` VARCHAR(191) NOT NULL,
    `prompt_tokens` INTEGER NOT NULL,
    `completion_tokens` INTEGER NOT NULL,
    `chat_id` BIGINT NOT NULL,
    `bot_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Completion_chat_id_bot_id_idx`(`chat_id`, `bot_id`),
    UNIQUE INDEX `Completion_completion_id_key`(`completion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Completion` ADD CONSTRAINT `Completion_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
