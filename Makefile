.PHONY: dev down logs mongo seed reset

dev:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

mongo:
	docker exec -it cafe-mongo-dev mongosh

seed:
	pnpm --filter server seed

reset:
	docker compose down -v