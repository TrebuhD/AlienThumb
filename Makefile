COMPOSE := docker-compose -f docker-compose.yml

SERVICES := node mongo mongo-express

run-dev:
	$(COMPOSE) up $(SERVICES)

run-dev-no-logs:
	$(COMPOSE) up -d $(SERVICES)

run-prod:
	@$(COMPOSEPROD) up $(SERVICES)

run-prod-no-logs:
	@$(COMPOSEPROD) up -d $(SERVICES)

stop:
	docker-compose down

rebuild:
	$(COMPOSE) up --build $(SERVICES)
