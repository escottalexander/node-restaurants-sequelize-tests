BEGIN;

CREATE TYPE boroughs AS ENUM (
	'Bronx', 'Brooklyln', 'Manhattan', 'Queens', 'Staten Island', 'Missing');

CREATE TABLE restaurants (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	name TEXT NOT NULL,
	cuisine TEXT,
	borough boroughs,
	address_building_number TEXT,
	address_street TEXT,
	address_zipcode TEXT
);

CREATE TABLE grades (
	id SERIAL PRIMARY KEY,
	created_at TIMESTAMP NOT NULL,
	updated_at TIMESTAMP NOT NULL,
	inspection_date TIMESTAMP NOT NULL,
	restaurant_id INTEGER REFERENCES restaurants ON DELETE CASCADE NOT NULL,
	grade TEXT NOT NULL,
	score INTEGER NOT NULL
);

COMMIT;