.PHONY: local
local:
	serverless offline start --apiKey any-pregenerated-key --stage local

.PHONY: dynamo
dynamo:
	docker-compose up local-dynamodb

.PHONY: dbinit
dbinit:
	./local/initialiseDB.sh