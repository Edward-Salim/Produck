ALTER TABLE "kanban_card"
ADD COLUMN "ticket_id" integer;

ALTER TABLE "kanban_card"
ADD CONSTRAINT "kanban_card_ticket_id_ticket_id_fk"
FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id")
ON DELETE SET NULL;

CREATE UNIQUE INDEX "kanban_card_ticket_id_unique"
ON "kanban_card" USING btree ("ticket_id");
