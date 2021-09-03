.PHONY: local
local:
	serverless offline start --stage local

.PHONY: dynamo
dynamo:
	docker-compose up local-dynamodb
