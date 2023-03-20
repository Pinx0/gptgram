-- DropIndex
DROP INDEX `ChatBotConfig_bot_id_fkey` ON `ChatBotConfig`;

-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Prompt_chat_id_fkey` ON `Prompt`;

-- AlterTable
ALTER TABLE `ChatBotConfig` MODIFY `personality` TEXT NULL;

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
