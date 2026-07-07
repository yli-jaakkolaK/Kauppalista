-- Väliotsikot listan sisällä (esim. vuosikellon kuukaudet)
-- Aja tämä Supabasen SQL Editorissa.

alter table tuotteet add column is_header boolean not null default false;
