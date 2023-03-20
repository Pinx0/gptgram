/*
  Warnings:

  - You are about to drop the column `frequence_penalty` on the `ChatBot` table. All the data in the column will be lost.
  - Added the required column `frequency_penalty` to the `ChatBot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ChatBot_bot_id_fkey` ON `ChatBot`;

-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Prompt_chat_id_fkey` ON `Prompt`;

-- AlterTable
ALTER TABLE `ChatBot` DROP COLUMN `frequence_penalty`,
    ADD COLUMN `frequency_penalty` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatBot` ADD CONSTRAINT `ChatBot_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatBot` ADD CONSTRAINT `ChatBot_bot_id_fkey` FOREIGN KEY (`bot_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
