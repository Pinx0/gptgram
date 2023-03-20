/*
  Warnings:

  - You are about to drop the `ChatBot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Prompt_chat_id_fkey` ON `Prompt`;

-- DropTable
DROP TABLE `ChatBot`;

-- CreateTable
CREATE TABLE `ChatBotConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chat_id` BIGINT NOT NULL,
    `bot_id` BIGINT NOT NULL,
    `speak_chance` DOUBLE NOT NULL DEFAULT 0,
    `name` VARCHAR(191) NOT NULL,
    `personality` VARCHAR(191) NULL,
    `first_message` VARCHAR(191) NULL,
    `history_length` INTEGER NOT NULL,
    `api_key` VARCHAR(191) NULL,
    `token_limit` INTEGER NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `frequency_penalty` DOUBLE NOT NULL,
    `presence_penalty` DOUBLE NOT NULL,

    UNIQUE INDEX `ChatBotConfig_chat_id_bot_id_key`(`chat_id`, `bot_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatBotConfig` ADD CONSTRAINT `ChatBotConfig_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatBotConfig` ADD CONSTRAINT `ChatBotConfig_bot_id_fkey` FOREIGN KEY (`bot_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
