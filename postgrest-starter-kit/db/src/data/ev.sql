create table if not exists ev (
	id    serial primary key,
	streetID  text,
	crime double precision,
	distance double precision
);

create table if not exists evType (
	id    serial primary key,
	EVType  text
);