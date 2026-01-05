ALTER TABLE "board_members" ALTER COLUMN "role" SET DATA TYPE "public"."board_member_role";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text DEFAULT '' NOT NULL;