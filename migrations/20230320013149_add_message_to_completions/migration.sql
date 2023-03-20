/*
  Warnings:

  - Added the required column `message_id` to the `Completion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Completion_chat_id_bot_id_idx` ON `Completion`;

-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Completion` ADD COLUMN `message_id` BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX `Completion_chat_id_bot_id_message_id_idx` ON `Completion`(`chat_id`, `bot_id`, `message_id`);

-- AddForeignKey
ALTER TABLE `Completion` ADD CONSTRAINT `Completion_chat_id_bot_id_message_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`, `message_id`) REFERENCES `Message`(`chat_id`, `bot_id`, `message_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Completion` ADD CONSTRAINT `Completion_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
