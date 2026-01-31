CREATE TABLE "board_favorites" (
	"boardId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"created_at" timestamptz NOT NULL,
	CONSTRAINT "board_favorites_boardId_userId_pk" PRIMARY KEY("boardId","userId")
);
--> statement-breakpoint
ALTER TABLE "board_favorites" ADD CONSTRAINT "board_favorites_boardId_boards_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_favorites" ADD CONSTRAINT "board_favorites_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "board_favorites_user_id" ON "board_favorites" USING btree ("userId");