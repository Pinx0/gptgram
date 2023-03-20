/*
  Warnings:

  - You are about to drop the `ChatBotConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Prompt` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chat_id,bot_id]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chat_id,bot_id,message_id]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bot_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bot_name` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency_penalty` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `history_length` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presence_penalty` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperature` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_limit` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bot_id` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Chat_chat_id_idx` ON `Chat`;

-- DropIndex
DROP INDEX `Chat_chat_id_key` ON `Chat`;

-- DropIndex
DROP INDEX `Message_chat_id_message_id_key` ON `Message`;

-- DropIndex
DROP INDEX `Message_chat_id_message_type_idx` ON `Message`;

-- DropIndex
DROP INDEX `Message_user_id_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Chat` ADD COLUMN `api_key` VARCHAR(191) NULL,
    ADD COLUMN `bot_id` BIGINT NOT NULL,
    ADD COLUMN `bot_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `first_message` VARCHAR(191) NULL,
    ADD COLUMN `frequency_penalty` DOUBLE NOT NULL,
    ADD COLUMN `history_length` INTEGER NOT NULL,
    ADD COLUMN `personality` TEXT NULL,
    ADD COLUMN `presence_penalty` DOUBLE NOT NULL,
    ADD COLUMN `speak_chance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `temperature` DOUBLE NOT NULL,
    ADD COLUMN `token_limit` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `bot_id` BIGINT NOT NULL;

-- DropTable
DROP TABLE `ChatBotConfig`;

-- DropTable
DROP TABLE `Prompt`;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_chat_id_bot_id_key` ON `Chat`(`chat_id`, `bot_id`);

-- CreateIndex
CREATE INDEX `Message_chat_id_bot_id_message_type_idx` ON `Message`(`chat_id`, `bot_id`, `message_type`);

-- CreateIndex
CREATE UNIQUE INDEX `Message_chat_id_bot_id_message_id_key` ON `Message`(`chat_id`, `bot_id`, `message_id`);

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_bot_id_fkey` FOREIGN KEY (`chat_id`, `bot_id`) REFERENCES `Chat`(`chat_id`, `bot_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
