-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
